import React, { PureComponent } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { initialize, showAliasMenuMobile, windowResize, handleNostrPublish, openReplyModal } from './actions';
import { NAV_HEIGHT } from './constants';
import { transition } from './helpers';

import ComingSoon from './components/Nostr/ComingSoon';
import PublicationsNav from './components/DirectoryPage/PublicationsNav';
import FrontPageFeed from './components/Nostr/FrontPageFeed';
import PostFeed from './components/Nostr/PostFeed';
import ProfileFeed from './components/Nostr/ProfileFeed';
import MobileEditor from './components/Nostr/MobileEditor';
import ZapRequest from './components/Nostr/ZapRequest';
import AliasMenuMobile from './components/Nav/AliasMenuMobile';
import LoadingText from './components/common/LoadingText';
import DirectoryPage from './components/DirectoryPage';
import EpochsPage from './components/EpochsPage';
import SidePanel from './components/SidePanel';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import QRDisplay from './components/QRDisplay';
import Nav from './components/Nav';


class App extends PureComponent {

  componentDidMount = async () => {

    this.props.initialize(this.props.store);

    window.addEventListener('resize', this.onWindowResize);
  };

  componentWillUnmount = () => {

    window.removeEventListener('resize', this.onWindowResize);
  };

  onWindowResize = () => {

    this.props.windowResize();
  };

  handleNostrPublish = (post, replyTo) => {

    return handleNostrPublish(post, replyTo, [
      this.props.mobileEditor.feed
    ]);
  }

  renderContent = () => {

    const { mobile, routeComponents } = this.props;
    const r = routeComponents[0];

    if (!(r === 'thread' || r === '')) {
      return null;
    }

    if (!this.props.main) { return null; }

    if (r === 'thread') {
      return mobile ? <PostFeed /> : <DirectoryPage />;
    }

    return mobile ? (
      <div>
        <PublicationsNav hidden={r === 'thread'} onSelectSort={() => { return; }} />
        <FrontPageFeed hidden={r === 'thread'} style={{ paddingTop: 60 }} />
      </div>
    ) : <DirectoryPage />;
  };

  renderMobileDimmer = () => {
    return (
      <div
        style={styles.mobileDimmer(this.props.mobileDimmer)}
        onClick={() => this.props.showAliasMenuMobile(false)}
      />
    );
  };

  render = () => {

    const { mobile, initialized, minHeight } = this.props;

    if (!initialized) {
      return <LoadingText style={styles.loadingText} />;
    }

    return (
      <div style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        minHeight
      }}>
        {mobile ? null : <div id='media_graph' style={{ zIndex: 1, position: 'absolute', left: '50%', transform: `translate(-50%, ${NAV_HEIGHT * -1}px)`, visibility: 'hidden' }} />}
        {this.props.zapRequest ? <ZapRequest /> : null}
        <Switch>
          <Route path='/' component={Nav} />
        </Switch>
        <div style={{
          paddingTop: NAV_HEIGHT,
          pointerEvents: this.props.mobileEditor.open ? 'none' : 'auto',
          opacity: this.props.mobileEditor.open ? 0 : 1
        }}>
          <Route exact path='/epochs' component={EpochsPage} />
          {this.renderContent()}
          <Switch>
            <Route exact path='/register' component={SignUp} />
            <Route path='/register/:mode' component={SignUp} />
          </Switch>
          <Route exact path='/auth' component={SignIn} />
          <Route path='/auth/:mode' component={SignIn} />
          <Route path='/@:alias' component={ProfileFeed} />
        </div>
        <Route exact path='/verify' component={ComingSoon} />
        <Route exact path='/theory' component={ComingSoon} />
        <Route exact path='/ln' component={ComingSoon} />
        {mobile ? <AliasMenuMobile /> : null}
        {this.props.sidePanelSection ? <SidePanel /> : null}
        {this.props.displayQR ? <QRDisplay /> : null}
        {this.renderMobileDimmer()}
        <MobileEditor
          metadata={this.props.metadata}
          clientHeight={this.props.clientHeight}
          clientWidth={this.props.clientWidth}
          innerHeight={this.props.innerHeight}
          onCancel={() => this.props.openReplyModal(null)}
          onResolve={() => this.props.openReplyModal(null)}
          handlePost={this.handleNostrPublish}
          {...this.props.mobileEditor}
        />
      </div>
    );
  };
}

const mapState = ({ app, menu, nostr }) => {

  return {
    ...app,
    zapRequest: nostr.zapRequest,
    metadata: nostr.metadata || {},
    main: nostr.main,
    sidePanelSection: menu.topMode,
    routeComponents: app.routeComponents || [],
    mobileEditor: nostr.mobileEditor || {},
  };
};

const styles = {

  mobileDimmer: (active) => {
    return {
      position: 'absolute',
      background: 'rgba(0,0,0,0.85)',
      height: '100%',
      width: '100%',
      pointerEvents: active ? 'visible' : 'none',
      opacity: active ? 1 : 0,
      top: 0,
      left: 0,
      zIndex: 1112,
      ...transition(0.2, 'ease', [ 'opacity' ])
    };
  },

  loadingText: {
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
};

export default connect(mapState, { initialize, showAliasMenuMobile, windowResize, openReplyModal })(App);

