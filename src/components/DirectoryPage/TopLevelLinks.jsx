import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { setDirectoryLayoutExpanded, navigate } from '../../actions';
import { transition } from '../../helpers';


class TopLevelLinks extends Component {

	state = { hover: '' };

	render = () => {

		return (
			<div style={{ paddingTop: 11 }}>
				{this.props.links.map(item => {

					const element = (
						<div
							key={item.handlerName ? item.key : undefined}
							onClick={this[item.handlerName]}
							onMouseOver={() => this.setState({ hover: item.key })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={styles.link({
								hover: this.state.hover === item.key,
							})}
						>
							{item.label}
						</div>
					);

					if (item.route) {

						return <Link key={item.key} to={item.route || '/'}>{element}</Link>;

					} else if (item.href) {

						return <a href={item.href} target='_blank' rel='noopener noreferrer' key={item.key}>{element}</a>;

					} else if (item.handlerName) {

						return element;
					}

					return null;

				})}
			</div>
		);
	};
}

const mapState = ({ active, app }) => {

	return {
		mobile: app.mobile,
		links: ([
			{
				key: 'cdn',
				label: 'Media Hosting',
				route: '/cdn'
			},
			{
				key: 'nip05',
				label: 'NIP-05 Verify',
				route: `/verify`
			},
			{
				key: 'opensource',
				label: 'Open Source',
				href: 'https://github.com/lovvtide/satellite-web'
			},
			{
				key: 'theory',
				label: 'Theory',
				route: `/theory`
			},
			{
				key: 'guide',
				label: 'LN ⚡',
				route: `/ln`
			}
		]).filter(item => {
			return item;
		})
	};
};

const styles = {

	link: ({ hover, active }) => {

		return {
			background: hover ? 'rgba(31,32,33,0.8)' : 'transparent',
			color: '#fff',
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'left',
			//fontFamily: 'JetBrains-Mono-Regular',
			fontSize: 13,
			fontWeight: 'bold',
			paddingLeft: 22,
			paddingRight: 22,
			marginRight: 12,
			height: 36,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			borderLeft: `2px solid ${hover ? '#fff' : 'transparent'}`,
			borderTopRightRadius: 12,
			borderBottomRightRadius: 12,
			...transition(0.2, 'ease', [ 'color' ])
		};
	}
};

export default connect(mapState, { navigate, setDirectoryLayoutExpanded })(TopLevelLinks);
