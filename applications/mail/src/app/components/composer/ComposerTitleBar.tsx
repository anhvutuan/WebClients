import { ReactNode } from 'react';
import { c } from 'ttag';
import { Icon, Tooltip, classnames, useMailSettings } from '@proton/components';
import { metaKey, shiftKey, isSafari as checkIsSafari } from '@proton/shared/lib/helpers/browser';

interface ButtonProps {
    onClick: () => void;
    className?: string;
    title?: ReactNode;
    children?: ReactNode;
    disabled?: boolean;
    dataTestId?: string;
}

const TitleBarButton = ({ onClick, children, className = '', title, disabled = false, dataTestId }: ButtonProps) => {
    return (
        <Tooltip title={title}>
            <button
                type="button"
                className={classnames(['composer-title-bar-button interactive flex p0-5', className])}
                onClick={onClick}
                disabled={disabled}
                data-testid={dataTestId}
            >
                {children}
            </button>
        </Tooltip>
    );
};

interface Props {
    title: string;
    minimized: boolean;
    maximized: boolean;
    toggleMinimized: () => void;
    toggleMaximized: () => void;
    onClose: () => void;
}

const ComposerTitleBar = ({ title, minimized, maximized, toggleMinimized, toggleMaximized, onClose }: Props) => {
    const isSafari = checkIsSafari();

    const [{ Shortcuts = 0 } = {}] = useMailSettings();

    const handleDoubleClick = () => {
        if (minimized) {
            toggleMinimized();
            return;
        }
        toggleMaximized();
    };

    const titleMinimize =
        Shortcuts && !isSafari ? (
            <>
                {minimized ? c('Action').t`Maximize composer` : c('Action').t`Minimize composer`}
                <br />
                <kbd className="no-border">{metaKey}</kbd> + <kbd className="no-border">M</kbd>
            </>
        ) : minimized ? (
            c('Action').t`Maximize composer`
        ) : (
            c('Action').t`Minimize composer`
        );

    const titleMaximize =
        Shortcuts && !isSafari ? (
            <>
                {maximized ? c('Action').t`Contract composer` : c('Action').t`Expand composer`}
                <br />
                <kbd className="no-border">{metaKey}</kbd> + <kbd className="no-border">{shiftKey}</kbd> +{' '}
                <kbd className="no-border">M</kbd>
            </>
        ) : maximized ? (
            c('Action').t`Contract composer`
        ) : (
            c('Action').t`Expand composer`
        );

    const titleClose = Shortcuts ? (
        <>
            {c('Action').t`Close composer`}
            <br />
            <kbd className="no-border">Escape</kbd>
        </>
    ) : (
        c('Action').t`Close composer`
    );

    return (
        <header
            className="composer-title-bar ui-prominent flex flex-row flex-align-items-center flex-nowrap pl0-5 pr0-5 w100"
            onDoubleClick={handleDoubleClick}
        >
            <span className="flex-item-fluid p0-5 pr1 text-ellipsis">{title}</span>
            <TitleBarButton
                className={classnames(['no-mobile', minimized && 'rotateX-180'])}
                title={titleMinimize}
                onClick={toggleMinimized}
                dataTestId="composer:minimize-button"
            >
                <Icon name="minimize" alt={title} className="mauto" />
            </TitleBarButton>
            <TitleBarButton
                title={titleMaximize}
                className="no-mobile"
                onClick={toggleMaximized}
                dataTestId="composer:maximize-button"
            >
                <Icon
                    name={
                        maximized
                            ? 'arrow-down-left-and-arrow-up-right-to-center'
                            : 'arrow-up-right-and-arrow-down-left-from-center'
                    }
                    alt={title}
                    className="mauto"
                />
            </TitleBarButton>
            <TitleBarButton title={titleClose} onClick={onClose} dataTestId="composer:close-button">
                <Icon name="xmark" alt={title} className="mauto" />
            </TitleBarButton>
        </header>
    );
};

export default ComposerTitleBar;
