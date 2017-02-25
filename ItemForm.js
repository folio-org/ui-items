import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import Paneset from '@folio/stripes-components/lib/Paneset'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane'; // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'; // eslint-disable-line
import {Row, Col} from 'react-bootstrap'; // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button'; // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField'; // eslint-disable-line
import Select from '@folio/stripes-components/lib/Select'; // eslint-disable-line
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup'; // eslint-disable-line
import RadioButton from '@folio/stripes-components/lib/RadioButton'; // eslint-disable-line

import {Field, reducer as formReducer, reduxForm} from 'redux-form'; // eslint-disable-line

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

  return (
    <form>
      <Paneset>
        <Pane defaultWidth="100%" firstMenu={addItemFirstMenu} lastMenu={initialValues ? editItemLastMenu : addItemLastMenu} paneTitle={initialValues ? 'Edit Item' : 'New Item'}>
          <Row>
            <Col sm={5} smOffset={1}>
              <h2>Item Record</h2>
              <Field label="Instance ID" name="instanceId" id="additem_instanceId" component={TextField} required fullWidth />
              <Field label="Title" name="title" id="additem_title" component={TextField} fullWidth />
              <Field label="Material Type" name="materialType.name" id="additem_materialType" component={TextField} fullWidth />
              <Field label="Barcode" name="barcode" id="additem_barcode" component={TextField} required fullWidth />
              <Field label="Location" name="location.name" id="additem_location" component={TextField} fullWidth />
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
