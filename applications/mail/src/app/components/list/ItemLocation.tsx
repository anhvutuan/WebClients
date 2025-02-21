import { useFolders, Tooltip, useMailSettings, classnames } from '@proton/components';

import { getCurrentFolders } from '../../helpers/labels';
import { Element } from '../../models/element';
import ItemIcon from './ItemIcon';

interface Props {
    element: Element | undefined;
    labelID: string;
    shouldStack?: boolean;
    showTooltip?: boolean;
    withDefaultMargin?: boolean;
}

const ItemLocation = ({
    element,
    labelID,
    shouldStack = false,
    showTooltip = true,
    withDefaultMargin = true,
}: Props) => {
    const [mailSettings] = useMailSettings();
    const [customFolders = []] = useFolders();
    let infos = getCurrentFolders(element, labelID, customFolders, mailSettings);

    if (infos.length > 1 && shouldStack) {
        infos = [
            {
                to: infos.map((info) => info.to).join(','),
                name: infos.map((info) => info.name).join(', '),
                icon: 'folders',
            },
        ];
    }

    return (
        <>
            {infos.map((folderInfo) => (
                <Tooltip title={showTooltip ? folderInfo.name : undefined} key={folderInfo.to}>
                    <span className={classnames(['flex flex-item-noshrink pt0-125', withDefaultMargin && 'mr0-25'])}>
                        <ItemIcon folderInfo={folderInfo} />
                    </span>
                </Tooltip>
            ))}
        </>
    );
};

export default ItemLocation;
