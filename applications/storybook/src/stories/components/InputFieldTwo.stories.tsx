import { useState } from 'react';
import { Icon, InputFieldTwo, PasswordInputTwo, TextAreaTwo } from '@proton/components';
import { getTitle } from '../../helpers/title';

import mdx from './InputFieldTwo.mdx';

export default {
    component: InputFieldTwo,
    title: getTitle(__filename, false),
    parameters: {
        docs: {
            page: mdx,
        },
    },
};

export const Playground = ({ ...args }) => <InputFieldTwo {...args} />;
Playground.args = {
    label: 'Basic input',
    hint: '',
    assistiveText: '',
    disabled: false,
    bigger: false,
    id: '',
    error: '',
    warning: '',
    rootClassName: '',
};
Playground.argTypes = {
    label: {
        type: { name: 'string' },
    },
    hint: {
        type: { name: 'string' },
    },
    assistiveText: {
        type: { name: 'string' },
    },
    error: {
        type: { name: 'string' },
    },
    warning: {
        type: { name: 'string' },
    },
    as: {
        table: {
            disable: true,
        },
    },
};

export const Basic = () => {
    const [value, setValue] = useState('');

    const sharedInputProps = {
        value,
        onValue: setValue,
        placeholder: "e.g. 'John Fitzgerald'",
    };

    const hint = `${value.length}/100`;

    return (
        <div>
            <div className="mb1">
                <InputFieldTwo label="Rudimentary" {...sharedInputProps} placeholder={undefined} />
            </div>
            <div className="mb1 mt1">
                <InputFieldTwo label="Hint" hint={hint} {...sharedInputProps} />
            </div>
            <div className="mb1 mt1">
                <InputFieldTwo
                    label="Assistive Text"
                    assistiveText="Your legal surname/s (separated by spaces)"
                    {...sharedInputProps}
                />
            </div>
            <div className="mb1 mt1">
                <InputFieldTwo
                    label="Hint & Assistive Text"
                    hint={hint}
                    assistiveText="Your legal surname/s (separated by spaces)"
                    {...sharedInputProps}
                />
            </div>
            <div className="mt1">
                <InputFieldTwo
                    disabled
                    label="Disabled"
                    hint={hint}
                    assistiveText="Your legal surname/s (separated by spaces)"
                    {...sharedInputProps}
                />
            </div>
        </div>
    );
};

export const Validation = () => {
    const sharedInputProps = {
        placeholder: "e.g. 'John Fitzgerald'",
    };

    return (
        <div>
            <div className="mb1">
                <InputFieldTwo label="Error" error="Something's not quite right here" {...sharedInputProps} />
            </div>
            <div className="mb1 mt1">
                <InputFieldTwo label="Warning" warning="This value might be wrong" {...sharedInputProps} />
            </div>
            <div className="mb1 mt1">
                <InputFieldTwo
                    label="Warning as boolean"
                    warning
                    assistiveText="Should be hidden"
                    {...sharedInputProps}
                />
            </div>
            <div className="mt1">
                <InputFieldTwo label="Error as boolean" error assistiveText="Should be hidden" {...sharedInputProps} />
            </div>
        </div>
    );
};

export const Adornments = () => {
    return (
        <div>
            <div className="mb1">
                <InputFieldTwo
                    label="Input with icon"
                    placeholder="**** **** **** ****"
                    icon={<Icon name="credit-card" />}
                />
            </div>
            <div className="mt1">
                <InputFieldTwo label="Input with suffix" placeholder="username" suffix="@protonmail.com" />
            </div>
        </div>
    );
};

export const Sizes = () => {
    const sharedInputProps = {
        placeholder: "e.g. 'John Fitzgerald'",
    };

    return (
        <div>
            <div className="mb1">
                <InputFieldTwo label="Default" {...sharedInputProps} />
            </div>
            <div className="mt1">
                <InputFieldTwo label="Bigger" bigger {...sharedInputProps} />
            </div>
        </div>
    );
};

export const CustomElements = () => {
    return (
        <div>
            <div className="mb1">
                <InputFieldTwo as={PasswordInputTwo} label="Password input" placeholder="Password" />
            </div>
            <div className="mb1">
                <InputFieldTwo as={TextAreaTwo} rows={3} label="Text area" placeholder="Placeholder" />
            </div>
        </div>
    );
};
