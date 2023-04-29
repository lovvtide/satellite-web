import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { transition } from '../../helpers';
import { COLORS } from '../../constants';


class Menu extends PureComponent {

	state = { hoverTop: '', hoverSub: '' };

	renderSubscriberCounts = (sub, active) => {

		const { subscribersCount, subscribedCount } = this.props;

		if (!sub) { return null; }

		const n = (sub === 'subscribers') ? subscribersCount : subscribedCount;

		return n ? <span style={{ fontFamily: 'JetBrains-Mono-Bold', color: active ? COLORS.blue : '#fff', marginLeft: 6, fontSize: 12 }}>({n})</span> : null;
	};

	render = () => {

		const { width, minHeight, sections, topMode, subMode, notificationsCount } = this.props;
		const sectionLabels = this.props.sectionLabels || {};

		return (
			<div style={styles.container(minHeight || null, width)}>
				<div>
					{sections.map((section, i) => {
						const active = topMode === section.value;
						const hoverTop = this.state.hoverTop === section.value;
						return (
							<div
								key={section.value}
								style={styles.menuSection(active, i === 0)}
								onClick={() => this.props.setMenuMode(section.value)}
								onMouseOver={() => this.setState({ hoverTop: section.value })}
								onMouseOut={() => this.setState({ hoverTop: '' })}
							>
								<div style={styles.menuSectionTitle(hoverTop, active)}>
									{typeof section.icon === 'undefined' ? null : (<Icon name={section.icon} style={styles.menuIconStyle} />)}
									<span>{sectionLabels[section.value] || section.value}</span>
									{section.value === 'notifications' && notificationsCount > 0 ? (<span style={{ fontFamily: 'JetBrains-Mono-Bold', color: COLORS.satelliteGold, marginLeft: 6, fontSize: 12 }}>({notificationsCount})</span>) : null}
								</div>
								{section.sub && section.sub.length > 0 ? (
									<div style={{ overflow: 'hidden', opacity: active ? 1 : 0, height: active ? (23 * section.sub.length) + 6 : 1, ...transition(0.2, 'ease', [ 'height', 'opacity' ]) }}>
										{section.sub.map((sub) => {
											const subsec = `${section.value}.${sub.value}`;
											const active = subMode[topMode] === sub.value;
											return (
												<div
													key={sub.label}
													style={styles.menuSectionSub(this.state.hoverSub === subsec, active)}
													onMouseOver={() => this.setState({ hoverSub: subsec })}
													onMouseOut={() => this.setState({ hoverSub: '' })}
													onClick={() => this.props.setMenuMode(topMode, sub.value)}
												>
													{sub.label}
													{this.renderSubscriberCounts(section.value === 'subscriptions' ? sub.value : null, active)}
												</div>
											);
										})}
									</div>
								) : null}
							</div>
						);
					})}
					<div
						style={{ ...styles.menuSection(), position: 'absolute', bottom: 0 }}
						onClick={this.props.handleSignOut}
						onMouseOver={() => this.setState({ hoverTop: 'signout' })}
						onMouseOut={() => this.setState({ hoverTop: '' })}
					>
						<div style={{ ...styles.menuSectionTitle(this.state.hoverTop === 'signout'), color: COLORS.secondaryBright, opacity: this.state.hoverTop === 'signout' ? 1 : 0.75 }}>
							<Icon name='sign out' style={styles.menuIconStyle} />
							<span>Disconnect Nostr</span>
						</div>
					</div>
				</div>
			</div>
		);
	};
}

const styles = {

	menuIconStyle: {
		fontSize: 13,
		marginRight: 0,
		width: 18,
		textAlign: 'left'
	},

	container: (height, width) => {
		return {
			height,
			width,
			float: 'right',
			borderRadius: 0,
			borderRight: '1px solid rgb(47, 54, 61)'
		};
	},

	menuSection: (active, first) => {
		return {
			paddingLeft: 24,
			paddingTop: 6,
			paddingBottom: 8,
			marginTop: first ? 12 : 0,
			background: active ? 'rgba(255,255,255,0.024)' : 'transparent'
		};
	},

	menuSectionTitle: (hover, active) => {
		return {
			cursor: 'pointer',
			fontSize: 13,
			paddingTop: 10,
			paddingBottom: 10,
			userSelect: 'none',
			color: active || hover ? '#fff' : 'rgba(255,255,255,0.5)',
		};
	},

	menuSectionSub: (hover, active) => {
		return {
			cursor: 'pointer',
			fontSize: 12,
			paddingLeft: 16,
			userSelect: 'none',
			opacity: hover || active ? 1 : 0.65,
			color: '#fff'
		};
	}
};

export default Menu;
