import React from 'react'
import api from './api.js'
    
    const styles = {};
styles.wrapper = {
//  background: '#fffff',
  color: '#28363D',

}

styles.border = {
//  background: '#5B6F79',
  border: '5px solid #5B6F79',

}

styles.paddingLeft = {
//  background: '#5B6F79',
  marginLeft: '15px',

}

styles.paddingRight = {
//  background: '#5B6F79',
  marginRight: '5px',

}


styles.headings = {
//  background: '#5B6F79',
  'textDecoration':'underline', 
//  'border-bottom': '5px solid #2C4537',

}
var MyActions = React.createClass ({
    contextTypes: {
    location: React.PropTypes.object,
    history: React.PropTypes.object.isRequired,

  },
    getInitialState: function() {
        return {
        }
    },
      componentDidMount: function() {
    api.getTables(this.tableSet);
  },
    tableSet: function(status, data) {
//      console.log(status);
//      console.log(data);
    if (status) {

//        console.log(this.state.tables);
    } else {
      // if the API call fails, redirect to the login page
        this.context.history.pushState(null, '/login');
    }
  },

  render: function() {
    return (
      <div style={styles.border}>
            <div className="row">
        <div className="col-md-5">
        <h2 style={styles.headings}>Callings that Require Action by Me</h2>
        </div>
        <div className="col-md-4" >
        </div>
        <div className="col-md-3" >
            <br/>
            <h4>My Calling: Bishop</h4>
        </div>
        </div>
        
    <div className="row">
        <div className="col-md-4"   style={styles.paddingLeft}>
              <div className="panel panel-danger">
              <div className="panel-heading">Immediate Actions</div>
              <div className="panel-body">
                    <p>1. Person to Call.</p> 
                    <p>2. Decide on Young Men's President</p>
                    <p>3. People to Set Apart.</p>
                </div>
                </div>
        </div>
        
        <div className="col-md-4">
              <div className="panel panel-info">
              <div className="panel-heading">Callings to be Filled</div>
              <div className="panel-body">
                    <ul>
                        <li>Call YM President.</li>
                        <li>Call Clerk.</li>
                        <li>Call Chorister.</li>
                        <li>Call Primary Teacher.</li>

                    </ul>
                </div>
                </div>
        </div>
        <div className="col-md-3"  style={styles.paddingRight}>
            <div className="panel panel-success">
          <div className="panel-heading">People to Contact</div>
          <div className="panel-body">
                <p>People who's family member died.</p>
                <p>People who need a visit.</p>
                <p>Widows.</p>
                <p>People who I should have RS Pres. Contact.</p>
                <p>Missionaries.</p>
            </div>
            </div>
        </div>
    </div>
    <div className="row">
               <div className="col-md-11"  style={styles.paddingLeft}>
                    <div className="panel panel-default">
          <div className="panel-heading">Notes</div>
          <div className="panel-body">
            <h3>Notes</h3>
            <p>Add notes here for callings, reminders for yourself. later you will be able to send notes from here to other bishopric members.</p>
                    </div>
            </div>
        </div>
    </div>
            <div className="row">
            </div>
        </div>
    )
  }

});

module.exports = MyActions;

//    <div className="row">

//      </div>



//        <div className="col-md-4">
//              <div className="panel panel-primary">
//              <div className="panel-heading">Callings to be Filled</div>
//              <div className="panel-body">
//                    <h3>Callings to be Filled</h3>
//                    <ul>
//                        <li>Call YM President.</li>
//                        <li>Call Clerk.</li>
//                        <li>Call Chorister.</li>
//                        <li>Call Primary Teacher.</li>
//
//                    </ul>
//                </div>
//                </div>
//        </div>
//        <div className="col-md-4">
//            <div className="panel panel-primary">
//          <div className="panel-heading">People to Contact</div>
//          <div className="panel-body">
//                <h3>People to Contact</h3>
//                <p>People who's family member died.</p>
//                <p>People who need a visit.</p>
//                <p>Widows.</p>
//                <p>People who I should have RS Pres. Contact.</p>
//                <p>Missionaries.</p>
//            </div>
//            </div>
//        </div>