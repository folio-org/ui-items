// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';
import Select from '@folio/stripes-components/lib/Select';
import TextField from '@folio/stripes-components/lib/TextField';
import { Field, reduxForm } from 'redux-form';

const propTypes = {
  onClose: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  newItem: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onCancel: PropTypes.func,
  initialValues: PropTypes.object,
};

function ItemForm(props) {
  const {
    handleSubmit,
    reset,  // eslint-disable-line no-unused-vars
    pristine,
    submitting,
    onCancel,
    initialValues,
  } = props;

  /* Menus for Add Item workflow */
  const addItemFirstMenu = <PaneMenu><button onClick={onCancel} title="close" aria-label="Close New Item Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
  const addItemLastMenu = <PaneMenu><Button type="submit" title="Create New Item" disabled={pristine || submitting} onClick={handleSubmit}>Create item</Button></PaneMenu>;
  const editItemLastMenu = <PaneMenu><Button type="submit" title="Update Item" disabled={pristine || submitting} onClick={handleSubmit}>Update item</Button></PaneMenu>;
  const materialTypeOptions = initialValues.available_material_types ?
        initialValues.available_material_types.map((t) => {
          let selectedValue;
          if (initialValues.materialType) { selectedValue = initialValues.materialType.name === t.name; }
          return {
            label: t.name,
            value: t.name,
            selected: selectedValue,
          };
        }) : [];
  const loanTypeOptions = initialValues.available_loan_types ?
        initialValues.available_loan_types.map((t) => {
          let selectedValue;
          if (initialValues.loanType) { selectedValue = initialValues.loanType.id === t.id; }
          return {
            label: t.name,
            value: t.id,
            selected: selectedValue,
          };
        }) : [];

  return (
    <form>
      <Paneset isRoot>
        <Pane defaultWidth="100%" firstMenu={addItemFirstMenu} lastMenu={initialValues.title ? editItemLastMenu : addItemLastMenu} paneTitle={initialValues.title ? 'Edit Item' : 'New Item'}>
          <Row>
            <Col sm={5} smOffset={1}>
              <h2>Item Record</h2>
              <Field label="Instance ID" name="instanceId" id="additem_instanceId" component={TextField} required fullWidth />
              <Field label="Title" name="title" id="additem_title" component={TextField} fullWidth />
              {/* <Field label="Material Type" name="materialType.name" id="additem_materialType" component={TextField} fullWidth /> */}
              <Field
                label="Material Type"
                name="materialType.name"
                id="additem_materialType"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select material type', value: null }, ...materialTypeOptions]}
              />
              <Field label="Barcode" name="barcode" id="additem_barcode" component={TextField} required fullWidth />
              <Field label="Location" name="location.name" id="additem_location" component={TextField} fullWidth />
              <Field
                label="Loan Type (Permanent)"
                name="permanentLoanType.id"
                id="additem_loanTypePerm"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select loan type', value: null }, ...loanTypeOptions]}
              />
              <Field
                label="Loan Type (Temporary)"
                name="temporaryLoanType.id"
                id="additem_loanTypeTemp"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select loan type', value: null }, ...loanTypeOptions]}
              />
            </Col>
          </Row>
        </Pane>
      </Paneset>
    </form>
  );
}

ItemForm.propTypes = propTypes;

export default reduxForm({
  form: 'itemForm',
})(ItemForm);
