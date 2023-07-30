import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { COLORS } from '../../constants';
import svglightning from '../../assets/lightning_white.svg';
import svgstar from '../../assets/up_white.svg';


class NavActions extends PureComponent {

	state = {};

	render = () => {

		const { mobile, modqueueN } = this.props;
		const { hover } = this.state;

		return (
			<div
				style={{
					color: '#fff',
					height: mobile ? 48 : 64,
					marginRight: -24,
					marginLeft: -24,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingLeft: mobile ? 24 : 24,
					paddingRight: mobile ? 16 : 24,
					marginBottom: 24,
					whiteSpace: 'nowrap',

					// marginTop: 20,
					// marginLeft: 0,
					// marginRight: 0,
					// background: 'rgba(255,255,255,0.035)',
					// border: `1px solid ${COLORS.secondary}`

				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
					}}
				>
{/*					<Link to={`/n/${this.props.name}/${this.props.ownernpub}`}>
						<div style={{ marginRight: 12 }}>[top posts]</div>
					</Link>*/}
					<Link to={`/n/${this.props.name}/${this.props.ownernpub}`}>
						<div
							onMouseOver={() => this.setState({ hover: 'top' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								opacity: !this.props.selected || hover === 'top' ? 1 : 0.85,
								userSelect: 'none',
								marginBottom: -2,
								fontSize: 12,
								marginRight: 14,
								fontFamily: 'JetBrains-Mono-Bold',
								color: '#fff',
								borderBottom: !this.props.selected ? `2px solid #fff` : `2px solid transparent`,
								height: 24
							}}
						>
{/*							{this.props.rankMode === 'zaps' ? (
								<img
									src={this.props.rankMode === 'zaps' ? svglightning : svgstar}
									style={{
										height: 12,
										marginRight: 4,
										transform: 'translate(0px, 2px)'
									}}
								/>
							) : (
								<Icon
									name='star outline'
								/>
							)}*/}
							<img
								src={this.props.rankMode === 'zaps' ? svglightning : svgstar}
								style={{
									height: 12,
									marginRight: 4,
									transform: this.props.rankMode === 'zaps' ? 'translate(0px, 2px)' : 'translate(0px, 1px)'
								}}
							/>
							{mobile ? 'TOP' : 'TOP POSTS'}
						</div>
					</Link>
					<Link to={`/n/${this.props.name}/${this.props.ownernpub}/new`}>
						<div
							onMouseOver={() => this.setState({ hover: 'new' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								opacity: this.props.selected === 'new' || hover === 'new' ? 1 : 0.85,
								userSelect: 'none',
								marginBottom: -2,
								fontSize: 12,
								marginRight: 14,
								fontFamily: 'JetBrains-Mono-Bold',
								color: '#fff',
								borderBottom: this.props.selected === 'new' ? `2px solid #fff` : `2px solid transparent`,
								height: 24
							}}
						>
							<Icon
								name='clock outline'
								style={{
									fontSize: 12,
									marginRight: 4,
								}}
							/>
							{mobile ? 'NEW' : 'NEW POSTS'}
						</div>
					</Link>
					<Link
						to={`/n/${this.props.name}/${this.props.ownernpub}/modqueue`}
						style={{
							display: 'flex'
						}}
					>
						<div
							onMouseOver={() => this.setState({ hover: 'modqueue' })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								opacity: this.props.selected === 'modqueue' || hover === 'modqueue' ? 1 : 0.85,
								userSelect: 'none',
								marginBottom: -2,
								fontSize: 12,
								display: 'flex',
								alignItems: 'center',
								fontFamily: 'JetBrains-Mono-Bold',
								color: '#fff',
								borderBottom: this.props.selected === 'modqueue' ? `2px solid #fff` : `2px solid transparent`
							}}
						>
							<Icon
								name='balance scale'
								style={{
									fontSize: 11,
									marginRight: 5,
									height: 21
								}}
							/>
							MODQUEUE
						</div>
						{modqueueN ? (
							<span
								style={{
									marginTop: -1,
									background: COLORS.secondary,
									marginLeft: 8,
									padding: '0px 8px',
									borderRadius: 24,
									fontSize: 11,
									lineHeight: '24px',
									//marginTop: 3,
									fontWeight: 'bold',
									color: 'rgba(255,255,255,0.85)'
								}}
							>
								{modqueueN}
							</span>
						) : null}
					</Link>
				</div>
				<Link to={`/n/${this.props.name}/${this.props.ownernpub}/submit`}>
					<div
						onMouseOver={() => this.setState({ hover: 'newpost' })}
						onMouseOut={() => this.setState({ hover: '' })}
						style={{
							fontSize: 12,
							color: COLORS.satelliteGold,
							fontFamily: 'JetBrains-Mono-Bold',
							//marginTop: 4,
							display: 'flex',
							alignItems: 'center',
							cursor: 'pointer',
					    padding: '3px 10px',
					    //border: `1px solid ${COLORS.satelliteGold}`,
					    borderRadius: 5,
					    lineHeight: '22px',
							opacity: mobile || this.state.hover === 'newpost' ? 1 : 0.85,
							marginRight: this.props.mobile ? 0 : -9,
							marginTop: '-0.5px',
							userSelect: 'none'
						}}
					>
						<Icon name='plus' style={{ height: 22, marginLeft: -1 }} />
						<span>SUBMIT POST</span>
					</div>
				</Link>
			</div>
		);
	};
}

export default NavActions;
