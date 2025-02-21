import { FORBIDDEN_LABEL_NAMES } from '@proton/shared/lib/constants';
import isTruthy from '@proton/shared/lib/helpers/isTruthy';
import { omit } from '@proton/shared/lib/helpers/object';
import { normalize } from '@proton/shared/lib/helpers/string';
import { ContactGroup, IMPORT_GROUPS_ACTION, ImportContactsModel } from '@proton/shared/lib/interfaces/contacts';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { c, msgid } from 'ttag';

import { Alert, SelectTwo, Option, Input } from '../../../components';

interface SelectGroupActionProps {
    action: IMPORT_GROUPS_ACTION;
    index: number;
    canMerge: boolean;
    onChange: (action: IMPORT_GROUPS_ACTION, index: number) => void;
}
const SelectGroupAction = ({ action, index, canMerge, onChange }: SelectGroupActionProps) => {
    const actionOptions = [
        canMerge && { text: c('Option').t`Add to existing group`, value: IMPORT_GROUPS_ACTION.MERGE },
        { text: c('Option').t`Create new group`, value: IMPORT_GROUPS_ACTION.CREATE },
        { text: c('Option').t`Ignore group`, value: IMPORT_GROUPS_ACTION.IGNORE },
    ].filter(isTruthy);

    return (
        <SelectTwo
            id="contact-group-action-select"
            value={action}
            onChange={({ value }) => onChange(value as IMPORT_GROUPS_ACTION, index)}
            title={c('Title').t`Select action to take on contact group`}
        >
            {actionOptions.map(({ text, value }) => (
                <Option key={value} value={value} title={text} />
            ))}
        </SelectTwo>
    );
};

interface SelectGroupProps {
    targetGroup: ContactGroup;
    targetName: string;
    contactGroups?: ContactGroup[];
    action: IMPORT_GROUPS_ACTION;
    index: number;
    error?: string;
    onChangeTargetGroup: (targetGroup: ContactGroup, index: number) => void;
    onChangeTargetName: (targetName: string, index: number) => void;
    onError: (error: string, index: number) => void;
}
const SelectGroup = ({
    targetGroup,
    targetName,
    contactGroups = [],
    action,
    index,
    error,
    onChangeTargetGroup,
    onChangeTargetName,
    onError,
}: SelectGroupProps) => {
    const groupNames = contactGroups.map(({ Name }) => Name);
    const groupsOptions = contactGroups.map((group) => ({
        text: group.Name,
        value: group,
    }));

    const handleChangeGroupName = ({ target }: ChangeEvent<HTMLInputElement>) => {
        // Clear previous errors
        onError('', index);
        const name = target.value;
        if (!name) {
            onError(c('Error').t`You must set a name`, index);
        } else if (groupNames.includes(name)) {
            onError(c('Error').t`A group with this name already exists`, index);
        } else if (FORBIDDEN_LABEL_NAMES.includes(normalize(name))) {
            onError(c('Error').t`Invalid name`, index);
        }
        onChangeTargetName(target.value, index);
    };

    if (action === IMPORT_GROUPS_ACTION.CREATE) {
        return (
            <Input
                id="contact-group-create"
                placeholder={c('Placeholder').t`Name`}
                maxLength={100}
                title={c('Title').t`Add contact group name`}
                error={error}
                isSubmitted={!!error}
                value={targetName}
                onChange={handleChangeGroupName}
            />
        );
    }

    if (action === IMPORT_GROUPS_ACTION.MERGE) {
        return (
            <SelectTwo
                id="contact-group-select"
                value={targetGroup}
                onChange={({ value }) => onChangeTargetGroup(value, index)}
                title={c('Title').t`Select contact group`}
            >
                {groupsOptions.map(({ text, value }) => (
                    <Option key={value.Name} value={value} title={text} />
                ))}
            </SelectTwo>
        );
    }
    return null;
};

interface Props {
    model: ImportContactsModel;
    setModel: Dispatch<SetStateAction<ImportContactsModel>>;
}
const ImportGroupsModalContent = ({ model, setModel }: Props) => {
    const { categories } = model;

    const handleChangeAction = (action: IMPORT_GROUPS_ACTION, index: number) => {
        setModel((model) => ({
            ...model,
            categories: model.categories.map((category, j) => {
                if (index !== j) {
                    return category;
                }
                return { ...omit(category, ['error']), action };
            }),
        }));
    };
    const handleChangeTargetGroup = (targetGroup: ContactGroup, index: number) => {
        setModel((model) => ({
            ...model,
            categories: model.categories.map((category, j) => {
                if (index !== j) {
                    return category;
                }
                return { ...category, targetGroup };
            }),
        }));
    };
    const handleChangeTargetName = (targetName: string, index: number) => {
        setModel((model) => ({
            ...model,
            categories: model.categories.map((category, j) => {
                if (index !== j) {
                    return category;
                }
                return { ...category, targetName };
            }),
        }));
    };
    const handleSetError = (error: string, index: number) => {
        setModel((model) => ({
            ...model,
            categories: model.categories.map((category, j) => {
                if (index !== j) {
                    return category;
                }
                return { ...category, error };
            }),
        }));
    };

    const rows = categories.map(({ name, totalContacts, action, targetGroup, targetName, error }, index) => {
        const totalContactsString = c('Import contact groups info').ngettext(
            msgid`${totalContacts} contact`,
            `${totalContacts} contacts`,
            totalContacts
        );
        const categoryString = `${name} (${totalContactsString})`;
        return (
            <div
                key={name}
                className="flex flex-nowrap flex-item-fluid flex-align-items-center on-tiny-mobile-flex-column mb1"
            >
                <div className="flex-item-fluid text-ellipsis mr1" title={categoryString}>
                    {categoryString}
                </div>
                <div className="flex-item-fluid mr1 on-mobile-mr0">
                    <SelectGroupAction
                        action={action}
                        index={index}
                        canMerge={!!model.contactGroups?.length}
                        onChange={handleChangeAction}
                    />
                </div>
                <div className="flex-item-fluid w30">
                    <SelectGroup
                        contactGroups={model.contactGroups}
                        action={action}
                        targetGroup={targetGroup}
                        targetName={targetName}
                        error={error}
                        index={index}
                        onChangeTargetGroup={handleChangeTargetGroup}
                        onChangeTargetName={handleChangeTargetName}
                        onError={handleSetError}
                    />
                </div>
            </div>
        );
    });

    return (
        <>
            <Alert>
                {c('Description')
                    .t`It looks like the contact list you are importing contains some groups. Please review how these groups should be imported.`}
            </Alert>
            {rows}
        </>
    );
};

export default ImportGroupsModalContent;
