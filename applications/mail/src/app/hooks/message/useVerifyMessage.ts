import { getMatchingKey, OpenPGPSignature } from 'pmcrypto';
import { VERIFICATION_STATUS } from '@proton/shared/lib/mail/constants';
import { useCallback } from 'react';
import { useApi, useGetEncryptionPreferences } from '@proton/components';
import { MessageErrors, MessageExtendedWithData } from '../../models/message';
import { verifyMessage } from '../../helpers/message/messageDecrypt';
import { useAttachmentCache } from '../../containers/AttachmentProvider';
import { updateMessageCache, useMessageCache } from '../../containers/MessageProvider';
import { useGetMessageKeys } from './useGetMessageKeys';
import { useContactCache } from '../../containers/ContactProvider';
import { extractKeysFromAttachments, extractKeysFromAutocrypt } from '../../helpers/message/messageKeys';
import { isNetworkError } from '../../helpers/errors';

export const useVerifyMessage = (localID: string) => {
    const api = useApi();
    const messageCache = useMessageCache();
    const attachmentsCache = useAttachmentCache();
    const getEncryptionPreferences = useGetEncryptionPreferences();
    const getMessageKeys = useGetMessageKeys();
    const { contactsMap } = useContactCache();

    return useCallback(
        async (decryptedRawContent: string, signature?: OpenPGPSignature) => {
            // Message can change during the whole sequence
            // To have the most up to date version, best is to get back to the cache version each time
            const getData = () => (messageCache.get(localID) as MessageExtendedWithData).data;

            const errors: MessageErrors = {};

            let encryptionPreferences;
            let verification;
            let signingPublicKey;
            let attachedPublicKeys;

            try {
                const senderAddress = getData().Sender.Address;

                encryptionPreferences = await getEncryptionPreferences(senderAddress, 0, contactsMap);

                const messageKeys = await getMessageKeys(getData());

                verification = await verifyMessage(
                    decryptedRawContent,
                    signature,
                    getData(),
                    encryptionPreferences.pinnedKeys
                );

                attachedPublicKeys = await extractKeysFromAttachments(
                    getData().Attachments,
                    messageKeys,
                    attachmentsCache,
                    api
                );
                const autocryptKeys = await extractKeysFromAutocrypt(getData().ParsedHeaders, senderAddress);

                const allSenderPublicKeys = [
                    ...encryptionPreferences.pinnedKeys,
                    ...encryptionPreferences.apiKeys,
                    ...attachedPublicKeys,
                    ...autocryptKeys,
                ];

                const signed = verification.verified !== VERIFICATION_STATUS.NOT_SIGNED;
                signingPublicKey =
                    signed && verification.signature
                        ? await getMatchingKey(verification.signature, allSenderPublicKeys)
                        : undefined;
            } catch (error) {
                if (isNetworkError(error)) {
                    errors.network = [error];
                } else {
                    errors.signature = [error];
                }
            } finally {
                updateMessageCache(messageCache, localID, {
                    verification: {
                        senderPinnedKeys: encryptionPreferences?.pinnedKeys,
                        signingPublicKey,
                        attachedPublicKeys,
                        senderVerified: encryptionPreferences?.isContactSignatureVerified,
                        verificationStatus: verification?.verified,
                        verificationErrors: verification?.verificationErrors,
                    },
                    errors,
                });
            }
        },
        [localID, contactsMap]
    );
};
