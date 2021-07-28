const httpStatus = require('http-status');
const { ApiError } = require('../middleware/apiError');
const { Product } = require('../models/product');
const mongoose = require('mongoose')

const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dzflb0v6i',
    api_key: '858954731391783',
    api_secret: `${process.env.CN_API_SECRET}`
})


const addProduct = async (body) => {

    try {
        const product = new Product({
            ...body
        })
        await product.save()
        return product
    } catch (error) {
        throw error
    }



}
const getProductById = async (_id) => {

    try {
        const product = await Product.findById(_id).populate('brand')
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product Not Found')
        return product
    } catch (error) {
        throw error
    }



}
const updateProductById = async (_id, body) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id },
            { "$set": body },
            { new: true }
        )
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product Not Found')
        return product

    } catch (error) {
        throw error
    }
}

const deleteProductById = async (_id) => {

    try {
        const product = await Product.findByIdAndRemove(_id)
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product Not Found')
        return product
    } catch (error) {
        throw error
    }
}

const allProducts = async (req) => {

    try {
        const products = await Product.find({}).populate('brand').sort([
            [req.query.sortby, req.query.order]
        ]).limit(parseInt(req.query.limit))

        return products
    } catch (error) {
        throw error
    }

}

const paginateProducts = async (req) => {
    try {
        let aggQueryArray = []

        if (req.body.keywords && req.body.keywords != '') {
            const re = new RegExp(`${req.body.keywords}`, 'gi')
            aggQueryArray.push({
                $match: { model: { $regex: re } }
            })
        }

        if (req.body.brand && req.body.brand.length > 0) {
            let newBrandsArray = req.body.brand.map((item) => (
                mongoose.Types.ObjectId(item)
            ))
            aggQueryArray.push({
                $match: { brand: { $in: newBrandsArray } }
            })
        }

        if (req.body.frets && req.body.frets.length > 0) {
            aggQueryArray.push({
                $match: { frets: { $in: req.body.frets } }
            })
        }

        if (req.body.min && req.body.min > 0 || req.body.max && req.body.max < 5000) {
            if (req.body.min) {
                aggQueryArray.push({ $match: { price: { $gt: req.body.min } } })
            }
            if (req.body.max) {
                aggQueryArray.push({ $match: { price: { $lt: req.body.max } } })
            }

        }


        //// add populate
        aggQueryArray.push({
            $lookup: {
                from: "brand",
                localField: "brand",
                foreignField: "_id",
                as: "brand"
            }

        },
            { $unwind: '$brand' }
        )



        let aggQuery = Product.aggregate(aggQueryArray)
        const options = {
            page: req.body.page,
            limit: 8,
            sort: { date: 'desc' }
        }
        const products = await Product.aggregatePaginate(aggQuery, options)
        return products

    } catch (error) {
        throw error
    }
}

const picUpload = async (req) => {
    try {
        const upload = await cloudinary.uploader.upload(req.files.file.path, {
            public_id: `${Date.now()}`,
            folder: 'waves_upload'
        });

        return {
            public_id: upload.public_id,
            url: upload.url
        }
    } catch (error) {
        throw error
    }
}







// {
//     "model":"Jet bt gold",
//     "brand":"6049a1ad9c9a2615b86c04f2",
//     "frets":22,
//     "woodtype":"Mahogany",
//     "description":"This is the content of the post",
//     "price":239,
//     "available":19,
//     "itemsSold":10,
//     "shipping":true
// }
// {
//     "model": "AZ2404",
//         "brand": "60e4472a0b51ae7b1084567e",
//             "frets": 24,
//                 "woodtype": "Mahogany",
//                     "description": "This is the content of the post",
//                         "price": 2400,
//                             "available": 5,
//                                 "itemsSold": 1,
//                                     "shipping": true
// }


module.exports = { addProduct, getProductById, updateProductById, deleteProductById, allProducts, paginateProducts, picUpload }