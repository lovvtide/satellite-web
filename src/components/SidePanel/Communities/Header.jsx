import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { COLORS, MENU_WIDTH } from '../../../constants';


class Header extends PureComponent {

  state = { hover: '' };

  renderCreateNewButton = () => {

    if (this.props.createNew || this.props.editing) { return null; }

    return (
      <div
        onClick={() => this.props.handleToggleEdit({ createNew: true })}
        onMouseOver={() => this.setState({ hover: 'new' })}
        onMouseOut={() => this.setState({ hover: '' })}
        style={{
          opacity: this.state.hover === 'new' ? 1 : 0.85,
          color: COLORS.satelliteGold,
          marginLeft: this.props.mobile ? 12 : 24,
          fontSize: 11,
          fontFamily: 'JetBrains-Mono-Regular',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Icon name='plus' style={{ height: 20, marginLeft: -3, marginRight: 5 }} />
        NEW COMMUNITY
      </div>
    );
  };

  renderBackToList = () => {

    return this.props.createNew || this.props.editing ? (
      <div
        onClick={() => this.props.handleToggleEdit({ createNew: false, editing: null })}
        onMouseOver={() => this.setState({ hover: 'new' })}
        onMouseOut={() => this.setState({ hover: '' })}
        style={{
          color: this.state.hover === 'new' ? '#fff' : 'rgba(255,255,255,0.85)',
          fontSize: 11,
          fontFamily: 'JetBrains-Mono-Regular',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Icon name='chevron left' style={{ height: 20, marginRight: 4 }} />
        {this.props.mobile ? 'LIST' : 'BACK TO LIST'}
      </div>
    ) : null;
  };

  renderMode = () => {

    if (this.props.createNew) {

      return (
        <div style={{ color: COLORS.secondaryBright, fontFamily: 'JetBrains-Mono-Bold' }}>
          NEW COMMUNITY
        </div>
      );
    }

    if (this.props.editing) {

      return (
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: this.props.mobile ? 12 : 16, height: this.props.mobile ? null : 24 }}>
          {this.props.editing.name}
        </div>
      );
    }

    return ( // TODO list selector
      <div style={{ fontSize: 13 }}>
        My Communities
      </div>
    );
  };

  render = () => {

    const { mobile } = this.props;

    return (
      <div
        id='list_header'
        style={{
          position: mobile ? 'fixed' : 'sticky',
          left: 1,
          top: mobile ? 48 : 0,
          fontSize: 12,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: mobile ? 12 : 24,
          paddingRight: mobile ? 12 : 24,
          background: COLORS.primary,
          width: mobile ? this.props.clientWidth : this.props.clientWidth - (12 + MENU_WIDTH),
          justifyContent: 'space-between',
          boxShadow: `${COLORS.primary} 0px 16px 16px 0px`,
          zIndex: 2
        }}
      >
        {this.renderMode()}
        {this.renderCreateNewButton()}
        {this.renderBackToList()}
      </div>
    );
  };
}


export default Header;
