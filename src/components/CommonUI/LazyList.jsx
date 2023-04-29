import React, { PureComponent } from 'react';


class LazyList extends PureComponent {

	state = { limit: 0 };

	constructor (props) {

		super(props);

		this.itemRefs = this.props.children.map(() => {
			return React.createRef();
		});
	}

	componentDidMount = () => {

		this.scrolling = this.props.overflowContainer;

		this.scrolling.addEventListener('scroll', this.handleScroll);

		this.setState({ limit: this.props.renderBatch });
	};

	componentWillUnmount = () => {

		this.scrolling.removeEventListener('scroll', this.handleScroll);
	}

	componentDidUpdate = (prevProps) => {

		if (this.props.children.length !== prevProps.children.length) {
			
			this.itemRefs = this.props.children.map(() => {
				return React.createRef();
			});
		}

		if (this.state.limit === this.props.renderBatch) { return; }

		const prevFirstElement = prevProps.children[0];

		const thisFirstElement = this.props.children[0];

		if (
			this.props.resetOnDataChange &&
			(!prevFirstElement || !thisFirstElement || prevFirstElement.key !== thisFirstElement.key)
		) {

			this.setState({ limit: this.props.renderBatch });
		}
	};

	maybeIncreaseLimit = () => {

		const windowHeight = this.props.windowHeight || window.innerHeight;

		for (let z = this.itemRefs.length - 1; z >= 0; z--) {

			const item = this.itemRefs[z];

			if (item.current) {

				const scrollAt = this.scrolling.scrollTop || this.scrolling.scrollY;
				const boundary = item.current.offsetTop - windowHeight;

				if (scrollAt >= boundary) {

					this.setState({ limit: this.state.limit + this.props.renderBatch });

					clearTimeout(this.scrollFinish);
				}

				break;
			}
		}
	};

	handleScroll = () => {

		clearTimeout(this.scrollFinish);

		this.maybeIncreaseLimit();

		this.scrollFinish = setTimeout(() => {

			this.maybeIncreaseLimit();

		}, 100);
	};

	render = () => {

		return this.props.children.filter((item, index) => {
			return item && index < this.state.limit;
		}).map((item, index) => {
			return (
				<div key={item.key} ref={this.itemRefs[index]}>
					{item}
				</div>
			);
		});
	};
}

export default LazyList;
