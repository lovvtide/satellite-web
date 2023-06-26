import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

import { COLORS } from '../../../constants';
import crownsvg from '../../../assets/crown.svg';


class ListItem extends PureComponent {

	state = {};

	render = () => {

		const { item } = this.props;

		const url = `/n/${item.name}/${nip19.npubEncode(item.event.pubkey)}`;

		return (
			<div
				//key={item.event.id}
				style={{
					marginBottom: 24
				}}
			>
				<Link to={url}>
					{item.image ? (
						<img
							src={item.image}
							style={{
								//border: `1px dotted ${COLORS.secondary}`,
								//backgroundImage: `url(${item.image})`,
								//backgroundPosition: 'center center',
								//backgroundSize: 'cover',
								position: 'relative',
								width: '100%',
								//height: 120
							}}
						/>
					) : (
						<div
							style={{
								width: '100%',
								height: 120,
								border: `1px dotted ${COLORS.secondary}`
							}}
						/>
					)}
				</Link>
				<div style={{
					display: 'flex',
					marginTop: 8,
					alignItems: 'center',
					justifyContent: 'space-between'
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center'
					}}>
						<Link to={url}>
							<div
								onMouseOver={() => this.setState({ hover: 'name' })}
								onMouseOut={() => this.setState({ hover: '' })}
								style={{
									textDecoration: this.state.hover === 'name' ? 'underline' : 'none',
									fontWeight: 'bold',
									color: '#fff',
									marginRight: 10,
									marginBottom: 3
								}}
							>
								{item.name}
							</div>
						</Link>
						<div style={{
							display: 'flex',
							alignItems: 'center'
						}}>
							{item.founder ? (
								<img
									src={crownsvg}
									style={{
										transform: 'translate(0px, -1px)',
										marginRight: 4,
										height: 12
									}}
								/>
							) : null}
							{item.moderator ? (
								<Icon
									name='flag outline'
									style={{ fontSize: 12, color: COLORS.blue, height: 20 }}
								/>
							) : null}
						</div>
					</div>
					<div style={{
						display: 'flex',
						alignItems: 'center',
						fontSize: 12,
						fontFamily: 'JetBrains-Mono-Regular',
						userSelect: 'none'
					}}>
						{item.founder ? (
							<div
								onClick={this.props.handleConfigClicked}
								onMouseOver={() => this.setState({ hover: 'config' })}
								onMouseOut={() => this.setState({ hover: '' })}
								style={{
									cursor: 'pointer',
									color: '#fff',
									opacity: this.state.hover === 'config' ? 1 : 0.85
								}}
							>
								<Icon name='cog' />
								SETTINGS
							</div>
						) : null}
					</div>
				</div>
			</div>
		);
	};
}

export default ListItem;
