/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {
  Component,
  createFactory,
} = require("resource://devtools/client/shared/vendor/react.mjs");
const dom = require("resource://devtools/client/shared/vendor/react-dom-factories.js");
const PropTypes = require("resource://devtools/client/shared/vendor/react-prop-types.mjs");
const {
  connect,
} = require("resource://devtools/client/shared/vendor/react-redux.js");
const Actions = require("resource://devtools/client/netmonitor/src/actions/index.js");
const {
  ACTIVITY_TYPE,
} = require("resource://devtools/client/netmonitor/src/constants.js");
const {
  L10N,
} = require("resource://devtools/client/netmonitor/src/utils/l10n.js");
const {
  getPerformanceAnalysisURL,
} = require("resource://devtools/client/netmonitor/src/utils/doc-utils.js");

// Components
const MDNLink = createFactory(
  require("resource://devtools/client/shared/components/MdnLink.js")
);

const { button, div, span } = dom;

const RELOAD_NOTICE_1 = L10N.getStr("netmonitor.reloadNotice1");
const RELOAD_NOTICE_2 = L10N.getStr("netmonitor.reloadNotice2");
const RELOAD_NOTICE_3 = L10N.getStr("netmonitor.reloadNotice3");
const RELOAD_NOTICE_BT = L10N.getStr("netmonitor.emptyBrowserToolbox");
const PERFORMANCE_NOTICE_1 = L10N.getStr("netmonitor.perfNotice1");
const PERFORMANCE_NOTICE_2 = L10N.getStr("netmonitor.perfNotice2");
const PERFORMANCE_NOTICE_3 = L10N.getStr("netmonitor.perfNotice3");
const PERFORMANCE_LEARN_MORE = L10N.getStr("charts.learnMore");

/**
 * UI displayed when the request list is empty. Contains instructions on reloading
 * the page and on triggering performance analysis of the page.
 */
class RequestListEmptyNotice extends Component {
  static get propTypes() {
    return {
      connector: PropTypes.object.isRequired,
      onReloadClick: PropTypes.func.isRequired,
      onPerfClick: PropTypes.func.isRequired,
    };
  }

  render() {
    const { connector } = this.props;
    const toolbox = connector.getToolbox();

    return div(
      {
        className: "request-list-empty-notice",
      },
      !toolbox.isBrowserToolbox
        ? div(
            { className: "notice-reload-message empty-notice-element" },
            span(null, RELOAD_NOTICE_1),
            button(
              {
                className: "devtools-button requests-list-reload-notice-button",
                "data-standalone": true,
                onClick: this.props.onReloadClick,
              },
              RELOAD_NOTICE_2
            ),
            span(null, RELOAD_NOTICE_3)
          )
        : div(
            { className: "notice-reload-message empty-notice-element" },
            span(null, RELOAD_NOTICE_BT)
          ),
      !toolbox.isBrowserToolbox
        ? div(
            { className: "notice-perf-message empty-notice-element" },
            span(null, PERFORMANCE_NOTICE_1),
            button({
              title: PERFORMANCE_NOTICE_3,
              className: "devtools-button requests-list-perf-notice-button",
              "data-standalone": true,
              onClick: this.props.onPerfClick,
            }),
            span(null, PERFORMANCE_NOTICE_2),
            MDNLink({
              url: getPerformanceAnalysisURL(),
              title: PERFORMANCE_LEARN_MORE,
            })
          )
        : null
    );
  }
}

module.exports = connect(undefined, (dispatch, props) => ({
  onPerfClick: () => dispatch(Actions.openStatistics(props.connector, true)),
  onReloadClick: () =>
    props.connector.triggerActivity(ACTIVITY_TYPE.RELOAD.WITH_CACHE_DEFAULT),
}))(RequestListEmptyNotice);
