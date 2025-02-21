import { useEffect, useMemo, useRef, useState } from 'react';
import { isPlainText } from '@proton/shared/lib/mail/messages';
import { scrollIntoView } from '@proton/shared/lib/helpers/dom';
import { classnames, Button, Tooltip } from '@proton/components';
import { c } from 'ttag';
import { MessageExtended } from '../../models/message';
import { locateBlockquote } from '../../helpers/message/messageBlockquote';
import { useEncryptedSearchContext } from '../../containers/EncryptedSearchProvider';

import './MessageBody.scss';
import MessageBodyImage from './MessageBodyImage';

interface Props {
    messageLoaded: boolean;
    bodyLoaded: boolean;
    sourceMode: boolean;
    message: MessageExtended;
    originalMessageMode: boolean;
    toggleOriginalMessage?: () => void;
    /**
     * Needed for print message
     * true: don't show button, show full content
     * false: (default) show button and collapse blockquote (if one founded)
     */
    forceBlockquote?: boolean;
    onMessageReady?: () => void;
    highlightKeywords?: boolean;
}

const MessageBody = ({
    messageLoaded,
    bodyLoaded,
    sourceMode: inputSourceMode,
    message,
    forceBlockquote = false,
    originalMessageMode,
    toggleOriginalMessage,
    onMessageReady,
    highlightKeywords = false,
}: Props) => {
    const bodyRef = useRef<HTMLDivElement>(null);
    const { highlightString } = useEncryptedSearchContext();
    const plain = isPlainText(message.data);

    const [content, blockquote] = useMemo(
        () => (plain ? [message.plainText as string, ''] : locateBlockquote(message.document)),
        [message.document?.innerHTML, message.plainText, plain]
    );

    const [, forceRefresh] = useState({});

    const encryptedMode = messageLoaded && !!message.errors?.decryption?.length;
    const sourceMode = !encryptedMode && inputSourceMode;
    const decryptingMode = !encryptedMode && !sourceMode && !bodyLoaded && messageLoaded;
    const loadingMode = !messageLoaded;
    const contentMode = !encryptedMode && !sourceMode && bodyLoaded;
    const isBlockquote = blockquote !== '';
    const showButton = !forceBlockquote && isBlockquote;
    const showBlockquote = forceBlockquote || originalMessageMode;
    const htmlContent = !!content && highlightKeywords ? highlightString(content, true) : content;
    const htmlBlockquote =
        !!blockquote && highlightKeywords
            ? highlightString(blockquote, !htmlContent.includes('data-auto-scroll'))
            : blockquote;

    useEffect(() => {
        if (!loadingMode && !decryptingMode && onMessageReady) {
            setTimeout(onMessageReady);
        }
    }, [loadingMode, decryptingMode, message.data?.ID]);

    useEffect(() => {
        // Images need a second render to find the anchors for the portal
        // This forced refresh create this doubled render when blockquote is toggled
        setTimeout(() => forceRefresh({}));
    }, [showBlockquote]);

    useEffect(() => {
        if (!!content && highlightKeywords) {
            const el = bodyRef.current?.querySelector('[data-auto-scroll]') as HTMLElement;
            scrollIntoView(el, { block: 'center', behavior: 'smooth' });
        }
    }, [htmlContent]);

    return (
        <div
            ref={bodyRef}
            className={classnames([
                'message-content scroll-horizontal-if-needed relative bodyDecrypted bg-norm color-norm',
                plain && 'plain',
            ])}
            data-testid="message-content:body"
        >
            {encryptedMode && <pre>{message.data?.Body}</pre>}
            {sourceMode && <pre>{message.decryptedBody}</pre>}
            {(loadingMode || decryptingMode) && (
                <>
                    <div className="message-content-loading-placeholder mb0-25 max-w8e" />
                    <div className="message-content-loading-placeholder mb0-25 max-w50e" />
                    <div className="message-content-loading-placeholder mb0-25 max-w40e" />
                    <div className="message-content-loading-placeholder mb0-25 max-w50e" />
                    <div className="message-content-loading-placeholder mb0-25 max-w15e" />
                    <div className="message-content-loading-placeholder max-w8e" />
                </>
            )}
            {contentMode && (
                <>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    {message.messageImages?.images.map((image) => (
                        <MessageBodyImage
                            key={image.id}
                            bodyRef={bodyRef}
                            showRemoteImages={message.messageImages?.showRemoteImages || false}
                            showEmbeddedImages={message.messageImages?.showEmbeddedImages || false}
                            image={image}
                        />
                    ))}
                    {isBlockquote && (
                        <>
                            {showButton && (
                                <Tooltip
                                    title={
                                        originalMessageMode
                                            ? c('Info').t`Hide original message`
                                            : c('Info').t`Show original message`
                                    }
                                >
                                    <Button
                                        size="small"
                                        shape="outline"
                                        className="m0-5 toggle-original-message-button"
                                        onClick={() => toggleOriginalMessage?.()}
                                        data-testid="message-view:expand-codeblock"
                                    >
                                        ...
                                    </Button>
                                </Tooltip>
                            )}
                            {/* eslint-disable-next-line react/no-danger */}
                            {showBlockquote && <div dangerouslySetInnerHTML={{ __html: htmlBlockquote }} />}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default MessageBody;
