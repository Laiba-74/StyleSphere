import React, { useState } from 'react'
import PayPal from '../../components/PayPal'

function PayPal() {
    const {checkout, setcheckOut} = useState(false);
  return (
    <>
    <div class="PayPal">
    {checkout ?(
        <PayPal />
    ) : (
        <button
        onClick={() =>{
            setcheckOut(true);
        }}
        >
        PayPal
        </button>
        )}
    </div> 
    </>
  )
}

export default PayPal
