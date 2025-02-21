import {
    useState,
    useEffect,
    useRef,
    useCallback,
    DragEvent,
    Ref,
    RefObject,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { c } from 'ttag';
import { Message } from '@proton/shared/lib/interfaces/mail/Message';
import { getRecipients } from '@proton/shared/lib/mail/messages';
import {
    classnames,
    useNotifications,
    useHandler,
    useSubscribeEventManager,
    useModals,
    ConfirmModal,
    ErrorButton,
    Alert,
    useLoading,
} from '@proton/components';
import { noop } from '@proton/shared/lib/helpers/function';
import { setBit, clearBit } from '@proton/shared/lib/helpers/bitset';
import useIsMounted from '@proton/components/hooks/useIsMounted';
import { EVENT_ACTIONS } from '@proton/shared/lib/constants';
import { canonizeEmail } from '@proton/shared/lib/helpers/email';
import { MessageExtended, MessageExtendedWithData, PartialMessageExtended } from '../../models/message';
import ComposerMeta from './ComposerMeta';
import ComposerContent from './ComposerContent';
import ComposerActions from './ComposerActions';
import { mergeMessages } from '../../helpers/message/messages';
import { getContent, setContent } from '../../helpers/message/messageContent';
import ComposerPasswordModal from './ComposerPasswordModal';
import ComposerExpirationModal from './ComposerExpirationModal';
import ComposerScheduleSendModal from './ComposerScheduleSendModal';
import { useMessage } from '../../hooks/message/useMessage';
import { useInitializeMessage } from '../../hooks/message/useInitializeMessage';
import { useSaveDraft, useDeleteDraft } from '../../hooks/message/useSaveDraft';
import { isNewDraft } from '../../helpers/message/messageDraft';
import { useAttachments } from '../../hooks/composer/useAttachments';
import { getDate } from '../../helpers/elements';
import { Breakpoints } from '../../models/utils';
import { EditorActionsRef } from './editor/SquireEditorWrapper';
import { useHasScroll } from '../../hooks/useHasScroll';
import { useReloadSendInfo, useMessageSendInfo } from '../../hooks/useSendInfo';
import { useDebouncedHandler } from '../../hooks/useDebouncedHandler';
import { DRAG_ADDRESS_KEY } from '../../constants';
import { useComposerHotkeys } from '../../hooks/composer/useComposerHotkeys';
import { updateMessageCache, useMessageCache } from '../../containers/MessageProvider';
import { ATTACHMENT_ACTION } from '../../helpers/attachment/attachmentUploader';
import { useSendHandler } from '../../hooks/composer/useSendHandler';
import { useCloseHandler } from '../../hooks/composer/useCloseHandler';
import { updateKeyPackets } from '../../helpers/attachment/attachment';
import { Event } from '../../models/event';
import { replaceEmbeddedAttachments } from '../../helpers/message/messageEmbeddeds';
import { useScheduleSend } from '../../hooks/composer/useScheduleSend';
import { useHandleMessageAlreadySent } from '../../hooks/composer/useHandleMessageAlreadySent';

enum ComposerInnerModal {
    None,
    Password,
    Expiration,
    ScheduleSend,
}

export type MessageUpdate = PartialMessageExtended | ((message: MessageExtended) => PartialMessageExtended);

export interface MessageChange {
    (update: MessageUpdate, reloadSendInfo?: boolean): void;
}

export interface MessageChangeFlag {
    (changes: Map<number, boolean>, reloadSendInfo?: boolean): void;
}

export interface ComposerAction {
    close: () => void;
}

interface Props {
    messageID: string;
    composerFrameRef: RefObject<HTMLDivElement>;
    breakpoints: Breakpoints;
    toggleMinimized: () => void;
    toggleMaximized: () => void;
    onFocus: () => void;
    onClose: () => void;
    onSubject: (subject: string) => void;
    isFocused: boolean;
}

const Composer = (
    {
        messageID,
        composerFrameRef,
        breakpoints,
        toggleMinimized,
        toggleMaximized,
        onFocus,
        onClose: inputOnClose,
        onSubject,
        isFocused,
    }: Props,
    ref: Ref<ComposerAction>
) => {
    const { createModal } = useModals();
    const messageCache = useMessageCache();
    const { createNotification } = useNotifications();
    const isMounted = useIsMounted();
    const [syncInProgress, withSyncInProgress] = useLoading();

    const bodyRef = useRef<HTMLDivElement>(null);
    const [hasVerticalScroll] = useHasScroll(bodyRef);

    // Indicates that the composer is in its initial opening
    // Needed to be able to force focus only at first time
    const [opening, setOpening] = useState(true);

    // Indicates that the composer is open but the edited message is not yet ready
    // Needed to prevent edition while data is not ready
    const [editorReady, setEditorReady] = useState(false);

    // Flag representing the presence of an inner modal on the composer
    const [innerModal, setInnerModal] = useState(ComposerInnerModal.None);

    // Model value of the edited message in the composer
    const [modelMessage, setModelMessage] = useState<MessageExtended>({
        localID: messageID,
    });

    // Map of send preferences and send icons for each recipient
    const messageSendInfo = useMessageSendInfo(modelMessage);
    const reloadSendInfo = useReloadSendInfo();

    // Synced with server version of the edited message
    const { message: syncedMessage } = useMessage(messageID);

    // onClose handler can be called in a async handler
    // Input onClose ref can change in the meantime
    const onClose = useHandler(inputOnClose);

    // Handles message already sent error
    const onMessageAlreadySent = useHandleMessageAlreadySent({
        modelMessage,
        onClose,
    });

    // All message actions
    const initialize = useInitializeMessage(syncedMessage.localID);
    const saveDraft = useSaveDraft({ onMessageAlreadySent });
    const deleteDraft = useDeleteDraft();

    // Computed composer status
    const hasRecipients = getRecipients(modelMessage.data).length > 0;
    const lock = opening;

    // Manage focus from the container yet keeping logic in each component
    const addressesBlurRef = useRef<() => void>(noop);
    const addressesFocusRef = useRef<() => void>(noop);
    const contentFocusRef = useRef<() => void>(noop);

    // Get a ref on the editor to trigger insertion of embedded images
    const editorActionsRef: EditorActionsRef = useRef();

    const handleDragEnter = (event: DragEvent) => {
        if (event.dataTransfer?.types.includes(DRAG_ADDRESS_KEY)) {
            onFocus();
        }
    };

    // Manage existing draft initialization
    useEffect(() => {
        if (
            !syncInProgress &&
            (syncedMessage.data?.ID || (!syncedMessage.data?.ID && !isNewDraft(syncedMessage.localID))) &&
            syncedMessage.initialized === undefined &&
            modelMessage.initialized === undefined
        ) {
            void initialize();
        }
    }, [
        syncInProgress,
        syncedMessage.localID,
        syncedMessage.data?.ID,
        syncedMessage.initialized,
        modelMessage.initialized,
    ]);

    // Manage populating the model from the server
    useEffect(() => {
        // Draft creation
        if (modelMessage.data?.ID !== syncedMessage.data?.ID) {
            const newModelMessage = {
                ...syncedMessage,
                ...modelMessage,
                data: {
                    ...syncedMessage.data,
                    ...modelMessage.data,
                    // Attachments are updated by the draft creation request
                    Attachments: syncedMessage.data?.Attachments,
                } as Message,
                messageImages: replaceEmbeddedAttachments(modelMessage, syncedMessage.data?.Attachments),
            };

            setModelMessage(newModelMessage);
        } else {
            // Draft update
            const { changed, Attachments } = updateKeyPackets(modelMessage, syncedMessage);

            if (changed) {
                setModelMessage({
                    ...modelMessage,
                    data: { ...modelMessage.data, Attachments } as Message,
                    messageImages: replaceEmbeddedAttachments(modelMessage, Attachments),
                });
            }
        }
    }, [syncInProgress, syncedMessage.data?.ID]);

    // Manage initializing the message from an existing draft
    useEffect(() => {
        const firstInitialization = !modelMessage.initialized && syncedMessage.initialized;

        if (firstInitialization) {
            const isOpenFromUndo = syncedMessage.openDraftFromUndo === true;
            const password = isOpenFromUndo
                ? // Keep password on undo
                  {}
                : // Forget previously setted password if kept in the cache
                  { Password: undefined, PasswordHint: undefined };

            const newModelMessage = {
                ...syncedMessage,
                ...modelMessage,
                document: syncedMessage.document,
                plainText: syncedMessage.plainText,
                messageImages: syncedMessage.messageImages,
                initialized: true,
                data: {
                    ...syncedMessage.data,
                    ...password,
                    ...modelMessage.data,
                    Attachments: syncedMessage.data?.Attachments,
                } as Message,
            };

            setModelMessage(newModelMessage);
            void reloadSendInfo(messageSendInfo, newModelMessage);
        }
    }, [syncInProgress, syncedMessage.document, syncedMessage.plainText, syncedMessage.initialized]);

    const timeoutRef = useRef(0);

    // Manage focus at opening
    useEffect(() => {
        if (!opening && isFocused) {
            timeoutRef.current = window.setTimeout(() => {
                if (getRecipients(syncedMessage.data).length === 0) {
                    addressesFocusRef.current();
                } else {
                    contentFocusRef.current();
                }
            });
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [opening, isFocused]);

    // Update subject on ComposerFrame
    useEffect(() => {
        onSubject(modelMessage.data?.Subject || c('Title').t`New message`);
    }, [modelMessage.data?.Subject]);

    // Listen to event manager to trigger reload send info
    useSubscribeEventManager(({ Contacts = [] }: Event) => {
        if (!Contacts.length) {
            return;
        }

        let shouldReloadSendInfo = false;

        const updatedAddresses = Contacts.map(({ Action, Contact }) => {
            if (Action === EVENT_ACTIONS.DELETE) {
                // If a contact has been deleted, we lost the associated emails
                // No way to match addresses, we reload info by security
                shouldReloadSendInfo = true;
            }

            return Contact?.ContactEmails.map(({ Email }) => canonizeEmail(Email)) || [];
        }).flat();

        const recipientsAddresses = getRecipients(modelMessage.data).map(({ Address }) => canonizeEmail(Address));

        const matches = updatedAddresses.find((address) => recipientsAddresses.includes(address));

        shouldReloadSendInfo = shouldReloadSendInfo || !!matches;

        if (shouldReloadSendInfo) {
            void reloadSendInfo(messageSendInfo, modelMessage);
        }
    });

    const actualSave = async (message: MessageExtended) => {
        try {
            await withSyncInProgress(saveDraft(message as MessageExtendedWithData));
        } catch {
            // Nothing, notifications are managed in saveDraft
        }
    };

    const {
        pending: pendingSave,
        pause: pauseAutoSave,
        restart: restartAutoSave,
        handler: autoSave,
    } = useDebouncedHandler(actualSave, 2000);

    const handleChange: MessageChange = useHandler((update, shouldReloadSendInfo) => {
        if (!isMounted()) {
            // Can happen when we finish an upload with the composer closed
            const messageChanges = update instanceof Function ? update(modelMessage) : update;
            const newModelMessage = mergeMessages(modelMessage, messageChanges);
            void autoSave(newModelMessage);
            return;
        }
        setModelMessage((modelMessage) => {
            const messageChanges = update instanceof Function ? update(modelMessage) : update;
            const newModelMessage = mergeMessages(modelMessage, messageChanges);
            if (shouldReloadSendInfo) {
                void reloadSendInfo(messageSendInfo, newModelMessage);
            }
            void autoSave(newModelMessage);
            return newModelMessage;
        });
    });

    const handleChangeContent = useHandler(
        (content: string, refreshEditor: boolean = false, silent: boolean = false) => {
            // On rare occasion, composer can trigger events after sending
            // We should absolutely avoid calling auto save and can forget about these events
            if (!isMounted()) {
                return;
            }
            setModelMessage((modelMessage) => {
                setContent(modelMessage, content);
                const newModelMessage = { ...modelMessage };
                if (!silent) {
                    void autoSave(newModelMessage);
                }
                if (refreshEditor) {
                    editorActionsRef.current?.setContent(newModelMessage);
                }
                return newModelMessage;
            });
        }
    );

    const handleChangeFlag = useHandler((changes: Map<number, boolean>, shouldReloadSendInfo: boolean = false) => {
        handleChange((message) => {
            let Flags = message.data?.Flags || 0;
            changes.forEach((isAdd, flag) => {
                const action = isAdd ? setBit : clearBit;
                Flags = action(Flags, flag);
            });
            return { data: { Flags } };
        }, shouldReloadSendInfo);
    });

    /**
     * In some rare situations, Squire can miss an input event.
     * A missed event can lead to not sending the expected content which is serious.
     * This function perform an ultimate content check before sending especially.
     */
    const ensureMessageContent = () => {
        // Should not be possible, more to satisfy TS
        if (!editorActionsRef.current) {
            return true;
        }

        const actualContent = editorActionsRef.current.getContent();
        const modelContent = getContent(modelMessage);

        if (actualContent.trim() !== modelContent.trim()) {
            handleChangeContent(actualContent);
        }
    };

    /**
     * Ensure the draft is saved before continue
     */
    const handleSaveNow = async () => {
        if (!modelMessage.data?.ID) {
            autoSave.abort?.();
            return actualSave(modelMessage);
        }
    };

    const {
        pendingFiles,
        pendingUploads,
        promiseUpload,
        uploadInProgress,
        handleAddAttachmentsStart,
        handleAddAttachmentsUpload,
        handleCancelAddAttachment,
        handleRemoveAttachment,
        handleRemoveUpload,
    } = useAttachments({
        message: modelMessage,
        onChange: handleChange,
        onSaveNow: handleSaveNow,
        editorActionsRef,
        onMessageAlreadySent,
    });

    // Manage opening
    useEffect(() => {
        // New attachments to upload from scratch
        const attachmentToUpload = !!syncedMessage.initialAttachments?.length;

        if (attachmentToUpload) {
            const uploadInitialAttachments = async () => {
                const files = syncedMessage.initialAttachments;
                updateMessageCache(messageCache, messageID, { initialAttachments: undefined });
                await actualSave(syncedMessage);
                await handleAddAttachmentsUpload(ATTACHMENT_ACTION.ATTACHMENT, files);
            };
            void uploadInitialAttachments();
        }

        if (editorReady && syncedMessage.initialized && !attachmentToUpload) {
            setOpening(false);
        }
    }, [editorReady, syncedMessage.data, syncedMessage.initialized]);

    useEffect(() => {
        if (uploadInProgress) {
            pauseAutoSave();
        } else {
            restartAutoSave();
        }
    }, [uploadInProgress]);

    const handlePassword = () => {
        setInnerModal(ComposerInnerModal.Password);
    };
    const handleExpiration = () => {
        setInnerModal(ComposerInnerModal.Expiration);
    };
    const handleCloseInnerModal = () => {
        setInnerModal(ComposerInnerModal.None);
    };

    const handleDiscard = async () => {
        const messageFromCache = messageCache.get(modelMessage.localID) as MessageExtended;
        if (messageFromCache.data?.ID) {
            await withSyncInProgress(deleteDraft(messageFromCache));
        }
        createNotification({ text: c('Info').t`Draft discarded` });
    };

    const handleDelete = async () => {
        await new Promise<void>((resolve, reject) => {
            createModal(
                <ConfirmModal
                    onConfirm={resolve}
                    onClose={reject}
                    title={c('Title').t`Delete draft`}
                    confirm={<ErrorButton type="submit">{c('Action').t`Delete`}</ErrorButton>}
                >
                    <Alert type="error">{c('Info').t`Are you sure you want to permanently delete this draft?`}</Alert>
                </ConfirmModal>
            );
        });
        autoSave.abort?.();
        try {
            await handleDiscard();
        } finally {
            onClose();
        }
    };

    const { saving, handleManualSave, handleClose } = useCloseHandler({
        modelMessage,
        lock,
        ensureMessageContent,
        actualSave,
        autoSave,
        onClose,
        onDicard: handleDiscard,
        pendingSave,
        promiseUpload,
        uploadInProgress,
        onMessageAlreadySent,
    });

    const handleSend = useSendHandler({
        modelMessage,
        ensureMessageContent,
        mapSendInfo: messageSendInfo.mapSendInfo,
        promiseUpload,
        pendingSave,
        autoSave,
        onClose,
        onMessageAlreadySent,
    });

    const { loadingScheduleCount, handleScheduleSendModal, handleScheduleSend } = useScheduleSend({
        modelMessage: modelMessage as MessageExtendedWithData,
        setInnerModal,
        ComposerInnerModal,
        setModelMessage,
        handleSend,
    });

    useImperativeHandle(ref, () => ({
        close: handleClose,
    }));

    const handleEditorReady = useCallback(() => setEditorReady(true), []);

    const handleContentFocus = useCallback(() => {
        addressesBlurRef.current();
        onFocus(); // Events on the main div will not fire because the editor is in an iframe
    }, []);

    const { squireKeydownHandler, attachmentTriggerRef } = useComposerHotkeys({
        composerRef: composerFrameRef,
        handleClose,
        handleDelete,
        handleExpiration,
        handleManualSave,
        handlePassword,
        handleSend,
        toggleMinimized,
        toggleMaximized,
        lock: lock || !hasRecipients,
        saving,
    });

    return (
        <div
            className="composer-container flex flex-column flex-item-fluid relative w100"
            onDragEnter={handleDragEnter}
        >
            {innerModal === ComposerInnerModal.Password && (
                <ComposerPasswordModal
                    message={modelMessage.data}
                    onClose={handleCloseInnerModal}
                    onChange={handleChange}
                />
            )}
            {innerModal === ComposerInnerModal.Expiration && (
                <ComposerExpirationModal
                    message={modelMessage}
                    onClose={handleCloseInnerModal}
                    onChange={handleChange}
                />
            )}
            {innerModal === ComposerInnerModal.ScheduleSend && (
                <ComposerScheduleSendModal
                    onClose={handleCloseInnerModal}
                    onSubmit={handleScheduleSend}
                    messageLocalID={modelMessage.localID}
                />
            )}
            <div
                className={classnames([
                    'composer-blur-container flex flex-column flex-item-fluid max-w100',
                    // Only hide the editor not to unload it each time a modal is on top
                    innerModal === ComposerInnerModal.None ? 'flex' : 'hidden',
                ])}
            >
                <div
                    ref={bodyRef}
                    className="composer-body-container flex flex-column flex-nowrap flex-item-fluid max-w100 mt0-5"
                >
                    <ComposerMeta
                        message={modelMessage}
                        messageSendInfo={messageSendInfo}
                        disabled={lock}
                        onChange={handleChange}
                        onChangeContent={handleChangeContent}
                        addressesBlurRef={addressesBlurRef}
                        addressesFocusRef={addressesFocusRef}
                    />
                    <ComposerContent
                        message={modelMessage}
                        disabled={lock}
                        breakpoints={breakpoints}
                        onEditorReady={handleEditorReady}
                        onChange={handleChange}
                        onChangeContent={handleChangeContent}
                        onChangeFlag={handleChangeFlag}
                        onFocus={handleContentFocus}
                        onAddAttachments={handleAddAttachmentsStart}
                        onCancelAddAttachment={handleCancelAddAttachment}
                        onRemoveAttachment={handleRemoveAttachment}
                        onRemoveUpload={handleRemoveUpload}
                        pendingFiles={pendingFiles}
                        pendingUploads={pendingUploads}
                        onSelectEmbedded={handleAddAttachmentsUpload}
                        contentFocusRef={contentFocusRef}
                        editorActionsRef={editorActionsRef}
                        squireKeydownHandler={squireKeydownHandler}
                    />
                </div>
                <ComposerActions
                    className={hasVerticalScroll ? 'composer-actions--has-scroll' : undefined}
                    message={modelMessage}
                    date={getDate(syncedMessage.data, '')}
                    lock={lock}
                    opening={opening}
                    syncInProgress={syncInProgress}
                    onAddAttachments={handleAddAttachmentsStart}
                    onExpiration={handleExpiration}
                    onPassword={handlePassword}
                    onScheduleSendModal={handleScheduleSendModal}
                    onSend={handleSend}
                    onDelete={handleDelete}
                    addressesBlurRef={addressesBlurRef}
                    attachmentTriggerRef={attachmentTriggerRef}
                    loadingScheduleCount={loadingScheduleCount}
                />
            </div>
        </div>
    );
};

export default forwardRef(Composer);
