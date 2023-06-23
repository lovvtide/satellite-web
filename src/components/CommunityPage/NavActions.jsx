import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { COLORS } from '../../constants';


class NavActions extends PureComponent {

	state = {};

	render = () => {

		const { mobile, modqueueN } = this.props;

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
					paddingLeft: 24,
					paddingRight: 24,
					marginBottom: 24,
					whiteSpace: 'nowrap'
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
							style={{
								userSelect: 'none',
								marginBottom: -2,
								fontSize: 12,
								marginRight: 12,
								fontFamily: 'JetBrains-Mono-Bold',
								color: '#fff',
								borderBottom: !this.props.selected ? `2px solid #fff` : `2px solid transparent`
							}}
						>
							APPROVED
						</div>
					</Link>
					<Link
						to={`/n/${this.props.name}/${this.props.ownernpub}/modqueue`}
						style={{
							display: 'flex'
						}}
					>
						<div
							style={{
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
							color: '#fff',
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
							marginTop: '-0.5px'
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
