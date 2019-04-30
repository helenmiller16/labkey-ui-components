import * as React from 'react';
import { SchemaQuery } from "@glass/base";
import batchesQueryInfo from "../../test/data/mixtureBatches-getQueryDetails.json";
import mixtureQuery from "../../test/data/mixtures-getQuery.json";
import { getQueryDetails, initQueryGridState } from "../..";
import mock, { proxy } from "xhr-mock";
import { QueryInfoForm } from "./QueryInfoForm";
import { shallow } from "enzyme";
import { QueryFormInputs } from "./QueryFormInputs";
import { Button, Modal, ModalTitle } from "react-bootstrap";

beforeAll(() => {
    initQueryGridState();

    mock.setup();

    mock.get(/.*\/query\/getQueryDetails.*/, {
        status: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(batchesQueryInfo)
    });

    mock.post(/.*\/query\/getQuery.*/, {
        status: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(mixtureQuery)

    });

    mock.use(proxy);

    LABKEY.contextPath = 'labkeyTest';

    LABKEY.container = {
        formats: {
            dateFormat: "yyyy-MM-dd",
            dateTimeFormat: "yyyy-MM-dd HH:mm",
            numberFormat: null
        }
    }
});

const schemaQuery = new SchemaQuery({
    schemaName: "schema",
    queryName: "q-snapshot"
});

describe("QueryInfoForm", () => {
   test("default props", () => {
       const onSubmit= jest.fn();
       return getQueryDetails(schemaQuery).then((queryInfo) => {
           const formWrapper = shallow(
               <QueryInfoForm schemaQuery={schemaQuery} queryInfo={queryInfo} onSubmit={onSubmit}/>
           );
           expect(formWrapper.find(QueryFormInputs)).toHaveLength(1);
           expect(formWrapper.find(Button)).toHaveLength(2);
       });
   });


   test("with header", () => {
       return getQueryDetails(schemaQuery).then( (queryInfo) => {
           const header = <span className={"header-info"}>Header info here</span>;
           const formWrapper = shallow(
               <QueryInfoForm header={header} schemaQuery={schemaQuery} queryInfo={queryInfo} onSubmit={jest.fn()}/>
           );

           expect(formWrapper.find('.header-info')).toHaveLength(1);
       })
   });

   test("as modal", () => {
       return getQueryDetails(schemaQuery).then( (queryInfo) => {
           const formWrapper = shallow(
               <QueryInfoForm asModal={true} schemaQuery={schemaQuery} queryInfo={queryInfo} onSubmit={jest.fn()}/>
           );
           expect(formWrapper.find(Modal)).toHaveLength(1);
           expect(formWrapper.find(ModalTitle)).toHaveLength(0);
       })
   });

   test("as modal with title", () => {
       return getQueryDetails(schemaQuery).then( (queryInfo) => {
           const formWrapper = shallow(
               <QueryInfoForm asModal={true} title={"Test modal title"} schemaQuery={schemaQuery} queryInfo={queryInfo} onSubmit={jest.fn()}/>
           );
           expect(formWrapper.find(Modal)).toHaveLength(1);
           const modalTitle = formWrapper.find(ModalTitle);
           expect(modalTitle).toHaveLength(1);
           expect(modalTitle.childAt(0).text()).toBe("Test modal title");

       });
   });

   test("custom text", () => {
       return getQueryDetails(schemaQuery).then( (queryInfo) => {
           const cancelText = "custom cancel text";
           const countText = "custom count text";
           const submitText = "custom submit text";
           const formWrapper = shallow(
               <QueryInfoForm
                   cancelText={cancelText}
                   countText={countText}
                   submitText={submitText}
                   schemaQuery={schemaQuery}
                   queryInfo={queryInfo}
                   onSubmit={jest.fn()}/>
           );
           const cancelButton = formWrapper.find(".test-loc-cancel-button");
           expect(cancelButton.childAt(0).text()).toBe(cancelText);
           const submitButton = formWrapper.find(".test-loc-submit-button");
           expect(submitButton.childAt(0).text()).toBe(submitText);
           expect(formWrapper.find({label: countText})).toHaveLength(1);
       })
   });


    // TODO the following tests require being able to interact with the form in order to make it
    // possible to submit the form.  Current attempts to do this interaction have been unsuccessful.
    // test("with error", () => {
    //
    // });
    //
    // test("submit", () => {
    //     return getQueryDetails(schemaQuery).then( (queryInfo) => {
    //         const formWrapper = mount(
    //             <QueryInfoForm schemaQuery={schemaQuery} queryInfo={queryInfo} onSubmit={jest.fn()}/>
    //         );
    //         console.log(formWrapper.debug());
    //
    //         const countInput = formWrapper.find("input#numItems");
    //         countInput.simulate('focus');
    //         countInput.simulate('change', { target: {value: "1"}});
    //         formWrapper.update();
    //         // console.log('countInput before', countInput.debug());
    //         // countInput.getElement().value=4;
    //         console.log("countInput after", countInput.debug());
    //         console.log("found again countInput after", formWrapper.find("input#numItems").debug());
    //         expect(countInput.prop('value')).toBe("3");
    //     });
    // });
});