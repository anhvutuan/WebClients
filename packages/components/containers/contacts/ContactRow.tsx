import { CSSProperties, ChangeEvent, DragEvent } from 'react';
import { c } from 'ttag';
import { SimpleMap } from '@proton/shared/lib/interfaces/utils';
import { ContactFormatted, ContactGroup } from '@proton/shared/lib/interfaces/contacts';
import { addPlus } from '@proton/shared/lib/helpers/string';
import { classnames } from '../../helpers';
import ContactGroupLabels from './ContactGroupLabels';
import { ItemCheckbox } from '../items';
import { Copy } from '../../components/button';
import { useNotifications } from '../../hooks';

interface Props {
    checked: boolean;
    onClick: (ID: string) => void;
    onCheck: (event: ChangeEvent) => void;
    style: CSSProperties;
    hasPaidMail: boolean;
    contactGroupsMap: SimpleMap<ContactGroup>;
    contact: ContactFormatted;
    draggable?: boolean;
    onDragStart?: (event: DragEvent) => void;
    onDragEnd?: (event: DragEvent) => void;
    dragged?: boolean;
}

const ContactRow = ({
    checked,
    style,
    hasPaidMail,
    contactGroupsMap,
    contact,
    onClick,
    onCheck,
    draggable,
    onDragStart,
    onDragEnd,
    dragged,
}: Props) => {
    const { createNotification } = useNotifications();
    const { ID, Name, LabelIDs = [], emails = [] } = contact;

    const contactGroups = contact.LabelIDs.map((ID) => contactGroupsMap[ID] as ContactGroup);

    const handleCopyEmail = () => {
        if (emails[0]) {
            createNotification({
                type: 'success',
                text: c('Success').t`Email address copied to clipboard`,
            });
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
            style={style}
            key={ID}
            onClick={() => onClick(ID)}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={classnames([
                'item-container item-contact flex cursor-pointer bg-global-white button-show-on-hover',
                dragged && 'item-dragging',
            ])}
        >
            <div className="flex flex-nowrap w100 h100 mtauto mbauto flex-align-items-center">
                <ItemCheckbox ID={ID} name={Name} checked={checked} onChange={onCheck} />
                <div className="flex-item-fluid pl1 flex flex-column flex-justify-space-between conversation-titlesender">
                    <div className="flex flex-nowrap flex-align-items-center item-firstline max-w100">
                        <div className={classnames(['flex flex-item-fluid w0', !!LabelIDs.length && 'pr1'])}>
                            <span
                                role="heading"
                                aria-level={2}
                                className="text-bold inline-block max-w100 text-ellipsis"
                                id={ID}
                            >
                                {Name}
                            </span>
                        </div>
                    </div>
                    <div
                        className="item-secondline max-w100 text-ellipsis item-sender--smaller"
                        title={emails.join(', ')}
                    >
                        {emails.length ? (
                            addPlus(emails as any)
                        ) : (
                            <span className="placeholder">{c('Info').t`No email address`}</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-column flex-nowrap pt0-5">
                    {hasPaidMail && contactGroups && <ContactGroupLabels contactGroups={contactGroups} />}
                    {emails[0] && (
                        <Copy
                            value={emails[0]}
                            className="flex-align-self-end button-show-on-hover-element mt0-25"
                            onCopy={handleCopyEmail}
                            tooltipText={c('Action').t`Copy email to clipboard`}
                            size="small"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactRow;
