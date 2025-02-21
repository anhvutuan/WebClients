import { useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { LoaderPage, ProtonApp, StandardSetup } from '@proton/components';
import { G_OAUTH_REDIRECT_PATH } from '@proton/components/containers/importAssistant/constants';

import sentry from '@proton/shared/lib/helpers/sentry';
import { initLocales } from '@proton/shared/lib/i18n/locales';

import * as config from './config';
import PrivateApp from './PrivateApp';
import { MAILTO_PROTOCOL_HANDLER_PATH } from './constants';

import './app.scss';

const locales = initLocales(require.context('../../locales', true, /.json$/, 'lazy'));

const enhancedConfig = {
    APP_VERSION_DISPLAY: '4.0.6',
    ...config,
};

sentry(enhancedConfig);

if ('registerProtocolHandler' in navigator) {
    try {
        navigator.registerProtocolHandler(
            'mailto',
            `${window.location.origin}${MAILTO_PROTOCOL_HANDLER_PATH}`,
            'ProtonMail'
        );
    } catch (e) {
        console.error(e);
    }
}

const App = () => {
    const [hasInitialAuth] = useState(() => {
        return !window.location.pathname.startsWith(G_OAUTH_REDIRECT_PATH);
    });

    return (
        <ProtonApp config={enhancedConfig} hasInitialAuth={hasInitialAuth}>
            <Switch>
                <Route path={G_OAUTH_REDIRECT_PATH}>
                    <LoaderPage />
                </Route>
                <Route path="*">
                    <StandardSetup PrivateApp={PrivateApp} locales={locales} />
                </Route>
            </Switch>
        </ProtonApp>
    );
};

export default App;
