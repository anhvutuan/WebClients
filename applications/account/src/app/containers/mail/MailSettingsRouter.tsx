import { Route, Redirect, Switch, useRouteMatch, useLocation } from 'react-router-dom';

import { useUser } from '@proton/components';

import MailAppearanceSettings from './MailAppearanceSettings';
import MailAutoReplySettings from './MailAutoReplySettings';
import MailDomainNamesSettings from './MailDomainNamesSettings';
import MailEncryptionKeysSettings from './MailEncryptionKeysSettings';
import MailFiltersSettings from './MailFiltersSettings';
import MailFoldersAndLabelsSettings from './MailFoldersAndLabelsSettings';
import MailGeneralSettings from './MailGeneralSettings';
import MailIdentityAndAddressesSettings from './MailIdentityAndAddressesSettings';
import MailImapSmtpSettings from './MailImapSmtpSettings';
import MailImportAndExportSettings from './MailImportAndExportSettings';

const MailSettingsRouter = () => {
    const { path } = useRouteMatch();
    const [user] = useUser();
    const location = useLocation();

    return (
        <Switch>
            <Route path={`${path}/general`}>
                <MailGeneralSettings user={user} location={location} />
            </Route>
            <Route path={`${path}/identity-addresses`}>
                <MailIdentityAndAddressesSettings location={location} />
            </Route>
            <Route path={`${path}/appearance`}>
                <MailAppearanceSettings location={location} />
            </Route>
            <Route path={`${path}/folders-labels`}>
                <MailFoldersAndLabelsSettings location={location} />
            </Route>
            <Route path={`${path}/filters`}>
                <MailFiltersSettings location={location} />
            </Route>
            <Route path={`${path}/auto-reply`}>
                <MailAutoReplySettings location={location} />
            </Route>
            <Route path={`${path}/domain-names`}>
                <MailDomainNamesSettings location={location} />
            </Route>
            <Route path={`${path}/encryption-keys`}>
                <MailEncryptionKeysSettings location={location} />
            </Route>
            <Route path={`${path}/import-export`}>
                <MailImportAndExportSettings location={location} />
            </Route>
            <Route path={`${path}/imap-smtp`}>
                <MailImapSmtpSettings location={location} />
            </Route>
            <Redirect to={`${path}/dashboard`} />
        </Switch>
    );
};

export default MailSettingsRouter;
