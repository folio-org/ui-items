import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Match from 'react-router/Match';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup';
import FilterGroups, { initialFilterState, filters2cql, onChangeFilter } from '@folio/stripes-components/lib/FilterGroups';

import ViewItem from './ViewItem';
import ItemForm from './ItemForm';

const filterConfig = [
  {
    label: 'Item Types',
    name: 'item',
    cql: 'materialType',
    values: [
      { name: 'Books', cql: 'Book' },
      { name: 'DVDs', cql: 'DVD' },
      'Microfilm',
    ],
  }, {
    label: 'Location',
    name: 'location',
    cql: 'location.name',
    values: ['Main Library', 'Annex Library'],
  },
];

class Items extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object,
  };

  static propTypes = {
    data: PropTypes.object.isRequired,
    pathname: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      query: PropTypes.object,
      search: PropTypes.string,
    }).isRequired,
    mutator: PropTypes.shape({
      addItemMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      items: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    addItemMode: { },
    items: {
      type: 'okapi',
      records: 'items',
      path: (queryParams, _pathComponents, _resourceValues) => {
        const { query, filters, sort } = queryParams || {};

        let cql;
        if (query) {
          cql = `materialType="${query}" or barcode="${query}*" or title="${query}*"`;
        }

        const filterCql = filters2cql(filterConfig, filters);
        if (filterCql) {
          if (cql) {
            cql = `(${cql}) and ${filterCql}`;
          } else {
            cql = filterCql;
          }
        }

        if (sort) {
          if (cql === undefined) cql = 'materialType=*';
          cql += ` sortby ${sort}`;
        }

        let path = 'item-storage/items';
        if (cql) path += `?query=${encodeURIComponent(cql)}`;

        console.log(`query=${query} filters=${filters} sort=${sort} -> ${path}`);
        return path;
      },
      staticFallback: { path: 'item-storage/items' },
    },
  });

  constructor(props) {
    super(props);

    const query = props.location.query || {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };
    props.mutator.addItemMode.replace({ mode: false });

    this.onChangeFilter = onChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);

    this.onClickAddNewItem = this.onClickAddNewItem.bind(this);
    this.onClickCloseNewItem = this.onClickCloseNewItem.bind(this);
  }

  updateFilters(filters) { // provided for onChangeFilter
    this.updateSearch(this.state.searchTerm, this.state.sortOrder, filters);
  }

  onChangeSearch(e) {
    const query = e.target.value;
    console.log(`User searched for '${query}' at '${this.props.location.pathname}'`);

    this.setState({ searchTerm: query });
    this.updateSearch(query, this.state.sortOrder, this.state.filters);
  }

  onClearSearch() {
    console.log('User cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    console.log('User sorted by', sortOrder);
    this.setState({ sortOrder });
    this.updateSearch(this.state.searchTerm, sortOrder, this.state.filters);
  }

  // Results Handler
  // row selection handler
  onSelectRow(e, meta) {
    const itemId = meta.id;
    console.log('User clicked', itemId, 'location = ', this.props.location, 'selected item = ', meta);
    this.setState({ selectedItem: meta });
    this.context.router.transitionTo(`/items/view/${itemId}${this.props.location.search}`);
  }

  // AddItem Handlers
  onClickAddNewItem(e) {
    if (e) e.preventDefault();
    console.log('User clicked "add new item"');
    this.props.mutator.addItemMode.replace({ mode: true });
  }

  onClickCloseNewItem(e) {
    if (e) e.preventDefault();
    console.log('User clicked "close new item"');
    this.props.mutator.addItemMode.replace({ mode: false });
  }

  create(data) {
    // POST item record
    console.log(`Creating new item record: ${JSON.stringify(data)}`);
    this.props.mutator.items.POST(data);
    this.onClickCloseNewItem();
  }

  // We need to explicitly pass changed values into this function,
  // as state-change only happens after event is handled.
  updateSearch(query, sortOrder, filters) {
    console.log(`updateSearch('${query}', '${sortOrder}',`, filters, ')');
    let transitionLoc = this.props.location.pathname;
    const params = {};
    if (query) params.query = query;
    if (sortOrder) params.sort = sortOrder;

    const activeFilters = [];
    for (const name in filters) {
      if (filters[name]) activeFilters.push(name);
    }

    if (activeFilters) params.filters = activeFilters.join(',');

    const keys = Object.keys(params);
    if (keys.length) {
      // eslint-disable-next-line prefer-template
      transitionLoc += '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    }
    this.context.router.transitionTo(transitionLoc);
  }

  render() {
    const { data, pathname } = this.props;
    const items = data.items || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      materialType: x => _.get(x, ['materialType', 'name']),
      location: x => _.get(x, ['location', 'name']),
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewItem}>New item</Button>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="40%"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{items.length} Result{items.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={resultMenu}
        >
          <MultiColumnList
            contentData={items}
            selectedRow={this.state.selectedItem}
            rowMetadata={['title', 'id']}
            headerMetadata={{ title: { _id: '001' } }}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            visibleColumns={['materialType', 'location', 'barcode', 'title']}
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Match pattern={`${pathname}/view/:itemid`} render={props => <ViewItem placeholder={'placeholder'} {...props} />} />
        <Layer isOpen={data.addItemMode ? data.addItemMode.mode : false} label="Add New Item Dialog">
          <ItemForm
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewItem}
          />
        </Layer>

      </Paneset>
    );
  }
}

export default Items;
