import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { COLORS, MENU_WIDTH } from '../../../constants';
import svgearth from '../../../assets/earth.svg';


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
          color: '#fff',
          marginLeft: this.props.mobile ? 12 : 24,
          fontSize: 11,
          fontFamily: 'JetBrains-Mono-Bold',
          height: 27,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          marginRight: 4,
          border: '1px solid #fff',
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 24
        }}
      >
        <Icon name='plus' style={{ height: 20, marginLeft: -3, marginRight: 5 }} />
        {this.props.mobile ? 'NEW' : 'NEW COMMUNITY'}
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
          userSelect: 'none',
          paddingBottom: 1
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
        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains-Mono-Regular', paddingBottom: 1 }}>
          <img
            src={svgearth}
            style={{
              marginRight: 8,
              height: 18,
              width: 18
            }}
          />
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

    const items = [
      {
        key: 'my_communities',
        label: 'My Communities'
      },
      {
        key: 'pending_approval',
        label: 'PENDING APPROVAL'
      }
    ];

    const approved = (this.props.modqueue || []).filter(item => {
      return this.props.approvals && !this.props.approvals[item.coord];
    });

    return ( // TODO list selector
      <div
        style={{
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          fontSize: 12,
          fontFamily: 'JetBrains-Mono-Regular',
          textTransform: 'uppercase'
        }}
      >
        {items.map(item => {

          const active = this.props.menu === item.key;

          return (
            <div
              key={item.key}
              onClick={() => this.props.handleMenuSelect(item.key)}
              style={{
                marginRight: 12,
                cursor: 'pointer',
                userSelect: 'none',
                padding: 4,
                borderBottom: `2px solid ${active ? '#fff' : 'transparent'}`
              }}
            >
              {item.label}
            </div>
          );
        })}
        {approved.length > 0 ? (
          <div
            style={{
              paddingBottom: 2,
              color: COLORS.satelliteGold,
              fontWeight: 'bold',
              marginLeft: -10,
              letterSpacing: 2
            }}
          >
            ({approved.length})
          </div>
        ) : null}
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
          //width: mobile ? this.props.clientWidth : this.props.clientWidth - (12 + MENU_WIDTH),
          justifyContent: 'space-between',
          boxShadow: `${COLORS.primary} 0px 16px 16px 0px`,
          zIndex: 2,
          width: '100%'
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
