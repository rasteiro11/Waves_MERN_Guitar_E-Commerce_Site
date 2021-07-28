import React, { useState, useEffect } from 'react';
import DashboardLayout from 'hoc/dashboardLayout';
import Loder from 'utils/loader';
import CartDetail from './cartDetail';

import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, userPurchaseSuccess } from 'store/actions/user.actions';

import { PayPalButton } from 'react-paypal-button-v2'
import Loader from 'utils/loader';


const UserCart = (props) => {
    const [loading, setLoading] = useState(false);
    const notifications = useSelector(state => state.notifications);
    const dispatch = useDispatch();


    const removeItem = (position) => {
        dispatch(removeFromCart(position))
    }


    const calculateTotal = () => {
        let total = 0;
        props.users.cart.forEach(item => {
            total += parseInt(item.price, 10);
        });
        return total;
    }

    const generateUnits = () => (
        [{
            description: "Guitars and accessories",
            amount: {
                currency_code: "BRL",
                value: calculateTotal(),
                breakdown: {
                    item_total: {
                        currency_code: "BRL",
                        value: calculateTotal()
                    }
                }
            },
            items: generateItems()
        }]
    )

    const generateItems = () => {
        let items = props.users.cart.map((item) => (
            {
                unit_amount: {
                    currency_code: "BRL",
                    value: item.price
                },
                quantity: 1,
                name: item.model
            }
        ))
        return items
    }

    useEffect(() => {
        if (notifications && notifications.cart) {
            props.history.push('/dashboard')
        }
        if (notifications && notifications.error) {
            setLoading(false)
        }

    }, [notifications, props.history])


    return (
        <DashboardLayout title="Your Cart">
            {props.users.cart && props.users.cart.length > 0 ?
                <>
                    <CartDetail
                        products={props.users.cart}
                        removeItem={(position) => removeItem(position)}
                    />
                    <div className="user_cart_sum">
                        <div>
                            Total amount: ${calculateTotal()}
                        </div>
                    </div>
                    {loading ?
                        <Loader />
                        :
                        <div className="pp_button">
                            <PayPalButton
                                options={{
                                    clientId: "AU_CvW0UaSV3EHuPGDn4kPYGgY52Jxhr4syXQqJXQhWlhSyyrb3foA6weW15ipToKC8ZFAr9VEPPSKJO",
                                    currency: "BRL",
                                    disableFunding: 'credit,card'
                                }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: generateUnits()
                                    })
                                }}
                                onSuccess={(details, data) => {
                                    // console.log(details)
                                    // console.log(data)
                                    dispatch(userPurchaseSuccess(details.id))
                                    setLoading(true)
                                }}
                                onCancel={(data) => {
                                    setLoading(false)
                                }}
                            />
                        </div>}
                </>
                :
                <div>
                    There is nothing in your cart
                </div>
            }
        </DashboardLayout>
    )

}

export default UserCart;