import * as React from 'react';
import {
    usePermissions,
    Paragraph,
    SettingsPropsShared,
    PrivateMainSettingsArea,
    SectionConfig,
    SettingsLink,
    ButtonLike,
} from '@proton/components';
import { hasPermission } from '@proton/shared/lib/helpers/permissions';
import { PERMISSIONS } from '@proton/shared/lib/constants';
import { c } from 'ttag';
import upgradeSvg from '@proton/styles/assets/img/placeholders/upgrade.svg';
import noAccessSvg from '@proton/styles/assets/img/errors/no-access-page.svg';

const { ADMIN, MEMBER } = PERMISSIONS;

interface Props extends SettingsPropsShared {
    config: SectionConfig;
    children?: React.ReactNode;
}

const PrivateMainSettingsAreaWithPermissions = ({ config, location, children, setActiveSection }: Props) => {
    const userPermissions = usePermissions();
    const { subsections = [], permissions: pagePermissions = [], text } = config;

    const noPermissionChild = (() => {
        if (userPermissions.includes(MEMBER) && pagePermissions.includes(ADMIN)) {
            return (
                <div id="page-error" className="text-center">
                    <img src={noAccessSvg} alt={c('Title').t`Password`} className="mb2" />
                    <h3 className="text-bold">{c('Title').t`Sorry, you can't access this page`}</h3>
                    <Paragraph>
                        {c('Info')
                            .t`Users can't make changes to organization settings. If you need admin privileges, reach out to your system administrator.`}
                    </Paragraph>
                </div>
            );
        }

        if (!hasPermission(userPermissions, pagePermissions)) {
            return (
                <div id="page-error" className="text-center pb2">
                    <img src={upgradeSvg} alt={c('Title').t`Upgrade`} className="mb2" />
                    <Paragraph>
                        {c('Info')
                            .t`Upgrade to a paid plan to access premium features and increase your storage space.`}
                    </Paragraph>
                    <ButtonLike as={SettingsLink} path="/dashboard" color="norm" size="large" className="mtauto">{c(
                        'Action'
                    ).t`Upgrade now`}</ButtonLike>
                </div>
            );
        }
    })();

    const childrenWithPermissions = React.Children.toArray(children)
        .filter(React.isValidElement)
        .map((child, index) => {
            const { permissions: sectionPermissions } = subsections[index] || {};
            return React.cloneElement(child, {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                permission: hasPermission(userPermissions, sectionPermissions),
            });
        });

    return (
        <PrivateMainSettingsArea
            title={text}
            location={location}
            setActiveSection={setActiveSection}
            subsections={noPermissionChild ? [] : subsections}
        >
            {noPermissionChild || childrenWithPermissions}
        </PrivateMainSettingsArea>
    );
};

export default PrivateMainSettingsAreaWithPermissions;
