import { EVENT_VERIFICATION_STATUS } from '@proton/shared/lib/calendar/constants';
import { getIsAllDay } from '@proton/shared/lib/calendar/vcalHelper';
import {
    DecryptedPersonalVeventMapResult,
    DecryptedVeventResult,
    EventModelReadView,
} from '@proton/shared/lib/interfaces/calendar';
import { VcalVeventComponent } from '@proton/shared/lib/interfaces/calendar/VcalModel';
import { useMemo } from 'react';

import { EventInternalProperties } from '../../interfaces/EventInternalProperties';
import { DecryptedEventTupleResult } from '../../containers/calendar/eventStore/interface';

import { propertiesToModel } from '../eventModal/eventForm/propertiesToModel';
import { propertiesToNotificationModel } from '../eventModal/eventForm/propertiesToNotificationModel';

const DEFAULT_VEVENT: VcalVeventComponent = {
    component: 'vevent',
    uid: { value: '123' },
    dtstart: {
        value: { year: 1970, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, isUTC: true },
    },
    dtend: {
        value: { year: 1970, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, isUTC: true },
    },
    dtstamp: {
        value: { year: 1970, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, isUTC: true },
    },
};
const useReadEvent = (value: DecryptedEventTupleResult | undefined, tzid: string): EventModelReadView => {
    return useMemo(() => {
        const [
            { veventComponent = DEFAULT_VEVENT, verificationStatus, selfAddressData },
            alarmMap = {},
            { IsOrganizer },
        ]: [DecryptedVeventResult, DecryptedPersonalVeventMapResult, EventInternalProperties] = value || [
            {
                veventComponent: DEFAULT_VEVENT,
                verificationStatus: EVENT_VERIFICATION_STATUS.NOT_VERIFIED,
                selfAddressData: {},
            },
            {},
            { Permissions: 1, IsOrganizer: 1 },
        ];
        const isAllDay = getIsAllDay(veventComponent);
        const isOrganizer = !!IsOrganizer;
        const model = propertiesToModel(
            { veventComponent, verificationStatus, selfAddressData },
            isAllDay,
            isOrganizer,
            tzid
        );
        const notifications = Object.keys(alarmMap)
            .map((key) => {
                return propertiesToNotificationModel(alarmMap[key]?.veventComponent, isAllDay);
            })
            .flat(1);

        return {
            ...model,
            isAllDay,
            notifications,
        };
    }, [value, tzid]);
};

export default useReadEvent;
