import { Alert } from '@proton/components';
import { c } from 'ttag';
import { Calendar } from '@proton/shared/lib/interfaces/calendar';
import CalendarTableRows from './CalendarTableRows';

interface Props {
    calendarsToReset: Calendar[];
}
const CalendarResetSection = ({ calendarsToReset = [] }: Props) => {
    return (
        <>
            <Alert type="warning">
                <div className="text-pre-wrap">
                    {c('Info')
                        .t`You have reset your password and events linked to the following calendars couldn't be decrypted.
                Any shared calendar links you created previously will no longer work.
                Any active subscribed calendars will synchronize again after a few minutes.`}
                </div>
            </Alert>
            <CalendarTableRows calendars={calendarsToReset} />
        </>
    );
};

export default CalendarResetSection;
