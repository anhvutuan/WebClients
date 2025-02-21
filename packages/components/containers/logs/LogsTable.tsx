import { c } from 'ttag';
import { SETTINGS_LOG_AUTH_STATE } from '@proton/shared/lib/interfaces';
import { AuthLog, AUTH_LOG_EVENTS } from '@proton/shared/lib/authlog';

import { Alert, Icon, Table, TableBody, TableCell, TableHeader, TableRow, Time } from '../../components';

const { ADVANCED, DISABLE } = SETTINGS_LOG_AUTH_STATE;

const getIcon = (event: AUTH_LOG_EVENTS) => {
    if (
        [
            AUTH_LOG_EVENTS.LOGIN_FAILURE_PASSWORD,
            AUTH_LOG_EVENTS.LOGIN_FAILURE_2FA,
            AUTH_LOG_EVENTS.REAUTH_FAILURE_2FA,
            AUTH_LOG_EVENTS.REAUTH_FAILURE_PASSWORD,
        ].includes(event)
    ) {
        return <Icon className="align-text-bottom color-danger" name="circle-xmark-filled" />;
    }

    return <Icon className="align-text-bottom color-success" name="circle-check-filled" />;
};

interface Props {
    logs: AuthLog[];
    logAuth: SETTINGS_LOG_AUTH_STATE;
    loading: boolean;
    error: boolean;
}

const LogsTable = ({ logs, logAuth, loading, error }: Props) => {
    if (logAuth === DISABLE) {
        return (
            <Alert>{c('Info')
                .t`You can enable authentication logging to see when your account is accessed, and from which IP. We will record the IP address that accesses the account and the time, as well as failed attempts.`}</Alert>
        );
    }

    if (!loading && !logs.length) {
        return <Alert>{c('Info').t`No logs yet.`}</Alert>;
    }

    if (!loading && error) {
        return <Alert type="error">{c('Info').t`Failed to fetch logs.`}</Alert>;
    }

    return (
        <Table>
            <TableHeader>
                <tr>
                    <TableCell type="header">{c('Header').t`Event`}</TableCell>
                    {logAuth === ADVANCED && <TableCell type="header">{logAuth === ADVANCED ? 'IP' : ''}</TableCell>}
                    <TableCell className="text-right" type="header">{c('Header').t`Time`}</TableCell>
                </tr>
            </TableHeader>
            <TableBody loading={loading} colSpan={3}>
                {logs.map(({ Time: time, Event, Description, IP }, index) => {
                    const key = index.toString();

                    return (
                        <TableRow key={key}>
                            <TableCell>
                                {getIcon(Event)} {Description}
                            </TableCell>
                            {logAuth === ADVANCED && (
                                <TableCell>
                                    <code>{IP || '-'}</code>
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <Time key={key} format="PPp">
                                    {time}
                                </Time>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default LogsTable;
