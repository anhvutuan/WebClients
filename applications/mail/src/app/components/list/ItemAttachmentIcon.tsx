import { c, msgid } from 'ttag';
import { classnames, Icon, Tooltip } from '@proton/components';

import { getNumAttachments } from '../../helpers/elements';
import { Element } from '../../models/element';

interface Props {
    element?: Element;
    className?: string;
}

const ItemAttachmentIcon = ({ element = {}, className }: Props) => {
    const numAttachments = getNumAttachments(element);

    if (numAttachments === 0) {
        return null;
    }

    const title = c('Info').ngettext(
        msgid`Has ${numAttachments} attachment`,
        `Has ${numAttachments} attachments`,
        numAttachments
    );

    return (
        <Tooltip title={title}>
            <div className={classnames(['flex', className])} data-testid="item-attachment-icon">
                <Icon name="paperclip" size={14} alt={title} />
            </div>
        </Tooltip>
    );
};

export default ItemAttachmentIcon;
