# Change history for ui-items

# 1.7.0 IN PROGRESS

* Sort-of-reinstate sorting by material-type. For deep reasons (see FOLIO-677) this can't work properly, but at least now each set of same-MT items are grouped together, even if the order of the groupings is apparently random. Fixes UIIT-28.
* When a new record is created, navigate to it. Fixes UIIT-29.
* Add rudimentary validation: require title, materialType and barcode. Fixes UIIT-30.

## [1.6.0](https://github.com/folio-org/ui-items/tree/v1.6.0) (2017-06-14)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.5.0...v1.6.0)

* Port from old `makePathFunction` to `makeQueryFunction`.
* Support reverse sorting. Fixes UIIT-25.
* Stable sorting: when moving from one sort criterion to another, the old one is retained as the secondary key. Fixes UIIT-26.
* Debounce search requests by 250 ms. Fixes UIIT-27.
* Upgrade stripes-components dependency to v0.15.0, needed for stable sorting.

## [1.5.0](https://github.com/folio-org/ui-items/tree/v1.5.0) (2017-06-08)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.4.0...v1.5.0)

* Updated dependency on stripes-components to 0.12.0
* Added appropriate props for infinite-scroll functionality of results list. (STRIPES-361)
* The editMode boolean is now in a stripes-core local resource instead of a piece of React component state. This makes edit-mode persistent because it's in the Redux store -- so navigating away from an edit-item page to another app, then returning to the Items app, will remain in edit mode. Fixes UIIT-22.
* Use `props.resources` (from stripes-connect v2.2.0) to determine actual hit count. Fixes UIIT-21.
* Require stripes-components v0.11.2, stripes-core v1.9.0 and stripes-connect v2.2.0.

## [1.4.0](https://github.com/folio-org/ui-items/tree/v1.4.0) (2017-06-06)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.3.0...v1.4.0)

* Loan & material types are now displayed/saved correctly when viewing/editing an item. Fixes STRIPES-355.
* Settings panes are sorted alphabetically. Fixes ui-items bit of STRIPES-358.
* Include item status in full-record display, and (disabled) in the edit page. Fixes UIIT-14.
* Initial status for new records set to "Available". Fixes UIIT-13.
* No instanceId required for new items (or displayed for old ones). At this stage, a dummy instanceId `'dummy'` is provided as part of each new item, but this will be removed in a subsequent version when the back-end no longer requires this field. Fixes UIIT-15.
* Current item kept in a different redux store resource from item list

## [1.3.0](https://github.com/folio-org/ui-items/tree/v1.3.0) (2017-05-08)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.2.0...v1.3.0)

* Permanent and temporary loan types now viewable and editable in the main UI. Completes LIBAPP-174.

## [1.2.0](https://github.com/folio-org/ui-items/tree/v1.2.0) (2017-05-05)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.1.0...v1.2.0)

* Settings page added for maintaining loan types. Fixes LIBAPP-173.
* Make item detail pane collapsible. Fixes LIBAPP-162.
* Editing an item record no longer leaves the widths of multi-pane display broken. Fixes STRIPES-316.
* Similar fixes to rendering of settings pages. Fixes STRIPES-330.
* Item records with no status are rendered without errors. Fixes STRIPES-318.
* All-records search now works again. Fixes the Items-module part of STRIPES-346.
* Components no longer connect themselves but their callers use curried connect. See STRIPES-338.
* The material-type filters are now populated dynamically from the set of material-types. Fixes STRIPES-287.
* Uses new-style settings API from stripes-core. See STRIPES-197.
* Uses react-router to navigate to pages within settings. Fixes STRIPES-340.
* Requires stripes-core v1.0.0 and stripes-components v0.7.0.

## [1.1.0](https://github.com/folio-org/ui-items/tree/v1.1.0) (2017-04-12)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.0.0...v1.1.0)

* Upgrade dependencies; stripes-core v0.6.0, stripes-connect v0.3.0, and stripes-components v0.6.0.

## [1.0.0](https://github.com/folio-org/ui-items/tree/v1.0.0) (2017-04-07)

* First formal release.

