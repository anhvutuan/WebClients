import { MouseEvent } from 'react';
import * as React from 'react';
import { c } from 'ttag';
import { textToClipboard } from '@proton/shared/lib/helpers/browser';

import { Icon } from '../icon';
import { Tooltip } from '../tooltip';
import Button, { ButtonProps } from './Button';

interface Props extends ButtonProps {
    value: string;
    className?: string;
    onCopy?: () => void;
    tooltipText?: string;
}

const Copy = ({ value, onCopy, tooltipText, ...rest }: Props, ref: React.Ref<HTMLButtonElement>) => {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        textToClipboard(value, e.currentTarget);
        onCopy?.();
    };

    return (
        <Tooltip title={tooltipText || c('Label').t`Copy`}>
            <Button icon color="weak" shape="outline" ref={ref} onClick={handleClick} {...rest}>
                <Icon name="copy" alt={c('Label').t`Copy`} />
            </Button>
        </Tooltip>
    );
};

export default React.forwardRef<HTMLButtonElement, Props>(Copy);
