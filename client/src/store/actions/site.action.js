import * as actions from './index'
import axios from 'axios'

import { getAuthHeader } from 'utils/tools'
axios.defaults.headers.post['Content-Type'] = 'application/json'

export const updateSiteVars = (args) => {
    return async (dispatch) => {
        try {
            const site = await axios.patch('/api/site', args, getAuthHeader())
            dispatch(actions.updateSiteVars(site.data))
            dispatch(actions.successGlobal("Site updated !!"))
        } catch (error) {
            dispatch(actions.errorGlobal(error.response.data.message))
        }
    }
}