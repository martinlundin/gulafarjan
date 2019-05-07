import React from 'react';

class HarborFilter extends React.Component {
    constructor(props) {
        super(props);

        let defaultHarbor = this.props.Harbors[0].Name;
        this.state = {
            "active": defaultHarbor
        };
        this.props.changeHarbor(defaultHarbor);
    }

    render() {
        return (
            <div className={`HarborFilter`}>
                {this.props.Harbors.map((Harbor) => (

                    <span key={Harbor.Id} className={this.state.active === Harbor.Name ? "active" : ""}
                          onClick={() => {
                              this.props.changeHarbor(Harbor.Name);
                              this.setState({"active": Harbor.Name})
                          }}>
                        {Harbor.Name}
                    </span>
                ))}
            </div>
        )
    }
}

export default HarborFilter;
