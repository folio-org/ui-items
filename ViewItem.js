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
    }),
    match: PropTypes.shape({
      params: PropTypes.object,
    }),
    mutator: React.PropTypes.shape({
      items: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
  };

  static manifest = Object.freeze({
    items: {
      type: 'okapi',
      path: 'item-storage/items/:{itemid}',
      clear: false,
    },
  });

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
    this.props.mutator.items.PUT(data).then(() => {
      this.onClickCloseEditItem();
    });
  }

  render() {
    const detailMenu = <PaneMenu><button onClick={this.onClickEditItem} title="Edit Item"><Icon icon="edit" />Edit</button></PaneMenu>;

    const { data: { items }, match: { params: { itemid } } } = this.props;
    if (!items || !itemid) return <div />;
    const item = items.find(i => i.id === itemid);

    return item ? (
      <Pane defaultWidth="fill" paneTitle={item.title} lastMenu={detailMenu}>
        <Row>
          <Col xs={12}>
            <KeyValue label="Title" value={_.get(item, ['title'], '')} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Material Type" value={_.get(item, ['materialType', 'name'], '')} />
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
        <Layer isOpen={this.state.editItemMode} label="Edit Item Dialog">
          <ItemForm
            onSubmit={(record) => { this.update(record); }}
            initialValues={item}
            onCancel={this.onClickCloseEditItem}
          />
        </Layer>
      </Pane>
    ) : null;
  }

}

export default ViewItem;
