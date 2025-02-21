import { removeCalendar } from '@proton/shared/lib/api/calendars';
import { MAX_SUBSCRIBED_CALENDARS_PER_USER } from '@proton/shared/lib/calendar/constants';
import { Address, UserModel } from '@proton/shared/lib/interfaces';
import { Calendar } from '@proton/shared/lib/interfaces/calendar';
import { useState } from 'react';
import { c, msgid } from 'ttag';
import { Alert, ConfirmModal, ErrorButton, Href } from '../../../components';
import { useApi, useEventManager, useFeature, useModals, useNotifications } from '../../../hooks';
import { FeatureCode } from '../../features';
import { CalendarModal } from '../calendarModal/CalendarModal';
import useSubscribedCalendars from '../../../hooks/useSubscribedCalendars';
import SubscribeCalendarModal from '../subscribeCalendarModal/SubscribeCalendarModal';
import CalendarsSection from './CalendarsSection';
import { SettingsParagraph } from '../../account';

interface Props {
    activeAddresses: Address[];
    calendars: Calendar[];
    user: UserModel;
}
const SubscribedCalendarsSection = ({ activeAddresses, calendars = [], user }: Props) => {
    const api = useApi();
    const { call } = useEventManager();
    const { createNotification } = useNotifications();
    const { createModal } = useModals();
    const [loadingMap, setLoadingMap] = useState({});
    const { subscribedCalendars, loading } = useSubscribedCalendars(calendars);
    const featureEnabled = !!useFeature(FeatureCode.CalendarSubscriptionBeta)?.feature?.Value;

    const handleCreate = () => {
        createModal(<SubscribeCalendarModal />);
    };

    const handleEdit = (calendar: Calendar) => {
        createModal(<CalendarModal calendar={calendar} />);
    };

    const handleDelete = async (id: string) => {
        const title = c('Title').t`Remove calendar`;
        const confirmText = c('Action').t`Remove calendar`;
        const alertText = c('Info').t`The calendar will be removed from your account.`;

        await new Promise<void>((resolve, reject) => {
            createModal(
                <ConfirmModal
                    title={title}
                    confirm={<ErrorButton type="submit">{confirmText}</ErrorButton>}
                    onClose={reject}
                    onConfirm={resolve}
                >
                    <Alert type="error">{alertText}</Alert>
                </ConfirmModal>
            );
        });
        try {
            setLoadingMap((old) => ({
                ...old,
                [id]: true,
            }));
            await api(removeCalendar(id));
            await call();
            createNotification({ text: c('Success').t`Calendar removed` });
        } finally {
            setLoadingMap((old) => ({ ...old, [id]: false }));
        }
    };

    const canAddCalendar =
        user.hasNonDelinquentScope &&
        activeAddresses.length > 0 &&
        calendars.length < MAX_SUBSCRIBED_CALENDARS_PER_USER;

    return (
        <CalendarsSection
            calendars={loading ? calendars : subscribedCalendars}
            user={user}
            loading={loading}
            loadingMap={loadingMap}
            canAdd={canAddCalendar}
            isFeatureUnavailable={!featureEnabled}
            add={c('Action').t`Subscribe to calendar`}
            calendarLimitReachedText={c('Calendar limit warning').ngettext(
                msgid`You have reached the maximum of ${MAX_SUBSCRIBED_CALENDARS_PER_USER} subscribed calendar.`,
                `You have reached the maximum of ${MAX_SUBSCRIBED_CALENDARS_PER_USER} subscribed calendars.`,
                MAX_SUBSCRIBED_CALENDARS_PER_USER
            )}
            description={
                <SettingsParagraph>
                    {c('Subscribed calendar section description')
                        .t`Add public, external, or shared calendars using a URL.`}
                    <br />
                    <Href url="https://protonmail.com/support/knowledge-base/calendar-subscribe">{c(
                        'Knowledge base link label'
                    ).t`Here's how`}</Href>
                </SettingsParagraph>
            }
            onAdd={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canUpgradeLimit={false}
        />
    );
};

export default SubscribedCalendarsSection;
