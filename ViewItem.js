import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';
import Icon from '@folio/stripes-components/lib/Icon';
import Layer from '@folio/stripes-components/lib/Layer';

import ItemForm from './ItemForm';

class ViewItem extends Component {

  static propTypes = {
    data: PropTypes.shape({
      item: PropTypes.arrayOf(PropTypes.object),
      materialTypes: PropTypes.arrayOf(PropTypes.object),
      loanTypes: PropTypes.arrayOf(PropTypes.object),
    }),
    match: PropTypes.shape({
      params: PropTypes.object,
    }),
    mutator: React.PropTypes.shape({
      selectedItem: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
    onClose: PropTypes.func,
    paneWidth: PropTypes.string.isRequired,
  };

  static manifest = Object.freeze({
    selectedItem: {
      type: 'okapi',
      path: 'inventory/items/:{itemid}',
      clear: false,
    },
    materialTypes: {
      type: 'okapi',
      path: 'material-types',
      records: 'mtypes',
    },
    loanTypes: {
      type: 'okapi',
      path: 'loan-types',
      records: 'loantypes',
    },
  });

  /*
   * Helper function for displaying property names in the item view. Given
   * a 'property' array of { id: x, name: y } entries, returns the name
   * corresponding to the specified id.
  */
  static propNameForId(id, property) {
    if (!id || !property) {
      return '';
    } else if (property.length > 0) {
      return _.find(property, { id }).name;
    }

    return id;
  }

  constructor(props) {
    super(props);

    this.state = {
      editItemMode: false,
    };
    this.onClickEditItem = this.onClickEditItem.bind(this);
    this.onClickCloseEditItem = this.onClickCloseEditItem.bind(this);
  }

  // Edit Item Handlers
  onClickEditItem(e) {
    if (e) e.preventDefault();
    this.setState({
      editItemMode: true,
    });
  }

  onClickCloseEditItem(e) {
    if (e) e.preventDefault();
    this.setState({
      editItemMode: false,
    });
  }

  update(data) {
    this.props.mutator.selectedItem.PUT(data).then(() => {
      this.onClickCloseEditItem();
    });
  }

  render() {
    const detailMenu = <PaneMenu><button onClick={this.onClickEditItem} title="Edit Item"><Icon icon="edit" />Edit</button></PaneMenu>;

    const { data: { selectedItem, loanTypes, materialTypes }, match: { params: { itemid } } } = this.props;
    if (!selectedItem || !itemid) return <div />;
    const item = selectedItem.find(i => i.id === itemid);

    return item ? (
      <Pane defaultWidth={this.props.paneWidth} paneTitle={item.title} lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <Row>
          <Col xs={12}>
            <KeyValue label="Title" value={_.get(item, ['title'], '')} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Material Type" value={ViewItem.propNameForId(_.get(item, ['materialType', 'id'], ''), materialTypes)} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Barcode" value={_.get(item, ['barcode'], '')} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Location" value={_.get(item, ['location', 'name'], '')} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Status" value={_.get(item, ['status', 'name'], '')} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Loan type (permanent)" value={ViewItem.propNameForId(_.get(item, ['permanentLoanType', 'id'], ''), loanTypes)} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Loan type (temporary)" value={ViewItem.propNameForId(_.get(item, ['temporaryLoanType', 'id'], ''), loanTypes)} />
          </Col>
        </Row>
        <Layer isOpen={this.state.editItemMode} label="Edit Item Dialog">
          <ItemForm
            onSubmit={(record) => { this.update(record); }}
            initialValues={_.merge(item, { available_material_types: this.props.data.materialTypes, available_loan_types: this.props.data.loanTypes })}
            onCancel={this.onClickCloseEditItem}
          />
        </Layer>
      </Pane>
    ) : null;
  }

}

export default ViewItem;
