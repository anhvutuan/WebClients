import { useState, useEffect, ReactNode, useCallback, forwardRef, Ref } from 'react';
import { PrivateAppContainer } from '@proton/components';
import { MAILBOX_LABEL_IDS } from '@proton/shared/lib/constants';
import { Location, History } from 'history';

import MailHeader from '../header/MailHeader';
import MailSidebar from '../sidebar/MailSidebar';
import { getHumanLabelID } from '../../helpers/labels';
import { setKeywordInUrl } from '../../helpers/mailboxUrl';
import { Breakpoints } from '../../models/utils';

interface Props {
    children: ReactNode;
    location: Location;
    history: History;
    breakpoints: Breakpoints;
    labelID: string;
    elementID: string | undefined;
    isBlurred?: boolean;
}

const PrivateLayout = (
    { children, location, history, breakpoints, labelID, elementID, isBlurred }: Props,
    ref: Ref<HTMLDivElement>
) => {
    const [expanded, setExpand] = useState(false);

    const handleSearch = useCallback((keyword = '', labelID = MAILBOX_LABEL_IDS.ALL_MAIL as string) => {
        history.push(setKeywordInUrl({ ...location, pathname: `/${getHumanLabelID(labelID)}` }, keyword));
    }, []);

    const handleToggleExpand = useCallback(() => setExpand((expanded) => !expanded), []);

    useEffect(() => {
        setExpand(false);
    }, [location.pathname, location.hash]);

    const header = (
        <MailHeader
            labelID={labelID}
            elementID={elementID}
            location={location}
            history={history}
            breakpoints={breakpoints}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
            onSearch={handleSearch}
        />
    );

    const sidebar = (
        <MailSidebar labelID={labelID} expanded={expanded} location={location} onToggleExpand={handleToggleExpand} />
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar} isBlurred={isBlurred} containerRef={ref}>
            {children}
        </PrivateAppContainer>
    );
};

export default forwardRef(PrivateLayout);
