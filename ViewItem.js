import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-flexbox-grid';
import Layer from '@folio/stripes-components/lib/Layer';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import removeQueryParam from '@folio/stripes-components/util/removeQueryParam';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';

import ItemForm from './ItemForm';

class ViewItem extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      materialTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loanTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selectedItem: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.object,
    }),
    mutator: PropTypes.shape({
      selectedItem: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }),
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    onClose: PropTypes.func,
    paneWidth: PropTypes.string.isRequired,
    stripes: PropTypes.shape({
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
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
    this.onClickEditItem = this.onClickEditItem.bind(this);
    this.onClickCloseEditItem = this.onClickCloseEditItem.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.removeQueryParam = removeQueryParam.bind(this);
    this.craftLayerUrl = craftLayerUrl.bind(this);
  }

  // Edit Item Handlers
  onClickEditItem(e) {
    if (e) e.preventDefault();
    this.props.stripes.logger.log('action', 'clicked "edit item"');
    this.transitionToParams({ layer: 'edit' });
  }

  onClickCloseEditItem(e) {
    if (e) e.preventDefault();
    this.props.stripes.logger.log('action', 'clicked "close edit item"');
    this.removeQueryParam('layer');
  }

  update(item) {
    this.props.mutator.selectedItem.PUT(item).then(() => {
      this.onClickCloseEditItem();
    });
  }

  render() {
    const { resources, location, match: { params: { itemid } } } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const selectedItem = (resources.selectedItem || {}).records || [];
    const materialTypes = (resources.materialTypes || {}).records || [];
    const loanTypes = (resources.loanTypes || {}).records || [];

    const detailMenu = (
      <PaneMenu>
        <IconButton
          icon="edit"
          id="clickable-edit-item"
          style={{ visibility: !selectedItem ? 'hidden' : 'visible' }}
          href={this.craftLayerUrl('edit')}
          onClick={this.onClickEditItem}
          title="Edit Item"
        />
      </PaneMenu>
    );

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
        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label="Edit Item Dialog">
          <ItemForm
            onSubmit={(record) => { this.update(record); }}
            initialValues={_.merge(item, { available_material_types: materialTypes, available_loan_types: loanTypes })}
            onCancel={this.onClickCloseEditItem}
          />
        </Layer>
      </Pane>
    ) : null;
  }
}

export default ViewItem;
