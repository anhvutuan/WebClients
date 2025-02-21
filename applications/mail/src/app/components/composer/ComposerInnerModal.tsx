import { ReactNode, useRef } from 'react';
import { c } from 'ttag';
import {
    HeaderModal,
    FooterModal,
    ContentModal,
    InnerModal,
    Button,
    PrimaryButton,
    useFocusTrap,
    useHotkeys,
} from '@proton/components';

interface Props {
    title: ReactNode;
    disabled?: boolean;
    children?: ReactNode;
    onCancel: () => void;
    onSubmit: () => void;
    submit?: ReactNode;
}

const ComposerInnerModal = ({ title, disabled = false, children, onCancel, onSubmit, submit }: Props) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const focusTrapProps = useFocusTrap({
        rootRef,
    });

    useHotkeys(rootRef, [
        [
            'Escape',
            (e) => {
                e.stopPropagation();
                onCancel?.();
            },
        ],
    ]);

    return (
        <div
            className="composer-inner-modal absolute w100 h100 flex flex-justify-center flex-align-items-center"
            ref={rootRef}
            {...focusTrapProps}
        >
            <div className="modal">
                <HeaderModal modalTitleID="" hasClose={false} onClose={onCancel}>
                    {title}
                </HeaderModal>
                <ContentModal onSubmit={onSubmit as () => undefined} onReset={onCancel as () => undefined}>
                    <InnerModal>{children}</InnerModal>
                    <FooterModal>
                        <Button type="reset" data-testid="modal-footer:cancel-button">
                            {c('Action').t`Cancel`}
                        </Button>
                        <PrimaryButton type="submit" disabled={disabled} data-testid="modal-footer:set-button">
                            {submit || c('Action').t`Set`}
                        </PrimaryButton>
                    </FooterModal>
                </ContentModal>
            </div>
        </div>
    );
};

export default ComposerInnerModal;
