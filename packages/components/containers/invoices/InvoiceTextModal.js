import React, { useContext, useState } from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { Modal, Alert, HeaderModal, ContentModal, FooterModal, Button, PrimaryButton, Label, TextArea, Block, ResetButton } from 'react-components';
import ContextApi from 'proton-shared/lib/context/api';
import { updateInvoiceText } from 'proton-shared/lib/api/settings';

const InvoiceTextModal = ({ show, onClose }) => {
    const { api } = useContext(ContextApi);
    const [invoiceText, setInvoiceText] = useState(''); // TODO get it from settings model
    const handleChange = (event) => setInvoiceText(event.target.value);

    const handleSubmit = async () => {
        await api(updateInvoiceText(invoiceText));
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} title={c('Title').t`Add invoice details`}>
            <ContentModal onSubmit={handleSubmit} onReset={onClose}>
                <Alert>{c('Info message for custom invoice modal').t`Add your name (or company name) and address to your invoices.`}</Alert>
                <Block>
                    <Label htmlFor="invoiceTextarea">{c('Label').t`Customize invoices`}</Label>
                </Block>
                <TextArea id="invoiceTextarea" value={invoiceText} placeholder={c('Placeholder for custom invoice text').t`Add your name (or company name) and address to your invoices`} onChange={handleChange} />
                <FooterModal className="flex flex-spacebetween">
                    <ResetButton>{c('Action').t`Close`}</ResetButton>
                    <PrimaryButton type="submit">{c('Action').t`Save`}</PrimaryButton>
                </FooterModal>
            </ContentModal>
        </Modal>
    );
};

InvoiceTextModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default InvoiceTextModal;