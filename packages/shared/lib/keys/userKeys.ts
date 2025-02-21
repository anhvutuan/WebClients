import {
    generateAddressKey,
    reformatAddressKey,
    ReformatAddressKeyArguments,
    GenerateAddressKeyArguments,
} from './addressKeys';

export const USER_KEY_USERID = 'not_for_email_use@domain.tld';

export const generateUserKey = async (args: Omit<GenerateAddressKeyArguments, 'email' | 'name'>) => {
    return generateAddressKey({ email: USER_KEY_USERID, ...args });
};

export const reformatUserKey = async (args: Omit<ReformatAddressKeyArguments, 'email' | 'name'>) => {
    return reformatAddressKey({ email: USER_KEY_USERID, ...args });
};
