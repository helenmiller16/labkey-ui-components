import * as React from 'react';
import { mount } from 'enzyme';
import { Button, FormControl, Modal } from "react-bootstrap";
import { Alert, LabelHelpTip } from "@glass/base";
import { ChangePasswordModal } from './ChangePasswordModal';
import { ChangePasswordModel } from "./models";
import { READER } from "../../test/data/users";

describe("<ChangePasswordModal/>", () => {

    test("without state", () => {
        const wrapper = mount(
            <ChangePasswordModal
                user={READER}
                onSuccess={jest.fn()}
                onHide={jest.fn()}
            />
        );

        const modal = wrapper.find(Modal);
        expect(modal.text()).toBe('Change PasswordOld Password New Password Retype New Password CancelSubmit');
        expect(modal.find(Alert)).toHaveLength(0);
        expect(modal.find(FormControl)).toHaveLength(3);
        expect(modal.find(LabelHelpTip)).toHaveLength(0);
        expect(modal.find(Button)).toHaveLength(2);
        expect(modal.find(Button).findWhere((btn) => btn.prop('disabled'))).toHaveLength(0);

        wrapper.unmount();
    });

    test("with state", () => {
        const wrapper = mount(
            <ChangePasswordModal
                user={READER}
                onSuccess={jest.fn()}
                onHide={jest.fn()}
            />
        );

        wrapper.setState({
            model: new ChangePasswordModel({oldPassword: 'old', password: 'new', password2: 'new2'}),
            passwordRule: 'Testing password rule description',
            submitting: true,
            error: 'Test Error'
        });

        const modal = wrapper.find(Modal);
        expect(modal.text()).toBe('Change PasswordOld Password New Password Retype New Password Test ErrorCancelSubmit');
        expect(modal.find(Alert)).toHaveLength(1);
        expect(modal.find(FormControl)).toHaveLength(3);
        expect(modal.find(LabelHelpTip)).toHaveLength(1);
        expect(modal.find(Button)).toHaveLength(2);
        expect(modal.find(Button).findWhere((btn) => btn.prop('disabled')).hostNodes()).toHaveLength(1);

        wrapper.unmount();
    });

});