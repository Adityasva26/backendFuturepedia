const db = require("../../_helpers/db");
const config = require("../../config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { productList } = require("./Admin.controller");
const Pricing = require("twilio/lib/rest/Pricing");
const { Category } = require("../../_helpers/db");
var moment = require("moment");
const User = db.User
const product = db.Product
const news = db.News
const category = db.Category
const feature = db.Feature
const pricing = db.Pricing
const favourites = db.Favourites
const comment = db.Comment
const blog = db.Blog

module.exports = {
    login,
    register,
    socialregister,
    HomePage,
    detailPage,
    RegexApi,
    Favourites,
    favouritesList,
    dropdown,
    categoryListbtType,
    newssdata,
    filter,
    discover,
    todayTools,
    todaynews,
    test,
    productByCategory,
    sorting,
    byTime,
    byCategory,
    newsSorting,
    adminDashboard
}


// Login Api
async function login(req, res) {
    console.log("login", req.body)

    if (req.body.email == "") {
        return res.status(200).json({
            message: language.Email_is_Required,
            status: "0",
        });
    }

    if (req.body.password == "") {
        return res.status(200).json({
            message: language.Password_is_Required,
            status: "0",
        });
    }

    const user = await User.findOne({ email: req.body.email.toLowerCase(), status: "Active" });
    if (!user) {
        return res.status(200).json({ message: "User Not found", status: "0" });
    }

    if (!user) {
        res.status(200).json({ message: "User Not found", status: "0" });
    } else {
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = jwt.sign({ sub: user.id }, config.secret, {
                expiresIn: "365d",
            });
            db.User.updateOne(
                { _id: user.id },
                {
                    $set: {
                        token: token,
                    },
                },
                async function (err, result) {
                    if (result) {
                        const Users = await User.findOne({ email: req.body.email });
                        Userdata = {
                            full_name: Users?.full_name,
                            email: Users?.email,
                            role: Users?.role_id,
                            created_at: Users?.created_at,
                            id: Users?._id,
                        };

                        console.log("Userdata", Userdata);
                        res.status(200).json({
                            message: " Success",
                            data: Userdata,
                            status: "1",
                        });
                    } else {
                        res.status(200).json({ message: "User Not Login", status: "0" });
                    }
                }
            );
        } else {
            res
                .status(200)
                .json({ message: "Invalid Email & Password", status: "0" });
        }
    }

}

//  social Login Api
async function socialregister(req, res) {
    try {
     const   social_id = req.body.social_id==undefined?"":req.body.social_id
    console.log("socialregisterewewewewe", social_id);
    console.log("socialregisteuserexist", await User.findOne({ social_id: social_id }));

    if (req.body.email == "") {
        return res.status(200).json({
            message: "email is Required",
            status: "0",
        });
    }
    if (req.body.full_name == "") {
        return res.status(200).json({
            message: "First Name is Required",
            status: "0",
        });
    }

    if (req.body.social_name == "") {
        return res.status(200).json({
            message: "social_name is Required",
            status: "0",
        });
    }
    if (await User.findOne({ social_id: social_id })) {
        console.log("Account Allready here", req.body);
        var Socialdataresult = await User.findOne({
            social_id: social_id,
        });

        const token = jwt.sign({ sub: Socialdataresult.id }, config.secret, {
            expiresIn: "365d",
        });

        db.User.updateOne(
            { _id: Socialdataresult.id },
            {
                $set: {
                    token: token,
                },
            },
            async function (err, result) {
                if (result) {
                    var user = await User.findOne({ social_id: social_id });
                    res.status(200).json({
                        data: user,
                        message: "Success",
                        status: "1",
                    });
                } else {
                    res.status(200).json({ message: "User Not Login", status: "0" });
                }
            }
        );
    } else {
        console.log("Social Register login")
        const payload = {
            email: req.body.email,
            full_name: req.body.full_name,
            social_id: social_id,
            social_name: req.body.social_name,
        };
        const token = jwt.sign(payload, config.secret, {
            expiresIn: "365d",
        });
        const Userdatavalue = new User({
            email: req.body.email,
            full_name: req.body.full_name,
            social_id: social_id,
            social_name: req.body.social_name,
            token: token,
        });
        await User.create(Userdatavalue, async function (err, result) {
            if (result) {
                const user = await User.findOne({ social_id: social_id });
                console.log("Add User Done");
                const token = jwt.sign({ sub: user.id }, config.secret, {
                    expiresIn: "365d",
                });
                await User.updateOne(
                    { _id: user.id },
                    {
                        $set: {
                            remember_token: token,
                        },
                    },
                    async function (err, result) {
                        if (result) {
                            var user = await User.findOne({
                                social_id: social_id,
                            });
                            return res.status(200).json({
                                message: "Success",
                                data: user,
                                status: "1",
                            });
                        } else {
                            return res
                                .status(200)
                                .json({ message: "User Not Login", status: "0" });
                        }
                    }
                );
            } else {
                console.log("Add User", err);
                return res.status(200).json({
                    message: "Register " + req.body.email + " Allready",
                    status: "0",
                });
            }
        });
    }
    } catch (err) {
        console.log("social login failed", err);
        res.status(200).json({
            message: "social login failed",
            status: "0",
        });
    }
}
// Register
async function register(req, res) {

    if (req.body.email == "") {
        return res.status(200).json({
            message: "Email is Required",
            status: "0",
        });
    }
    if (req.body.name == "") {
        return res.status(200).json({
            message: "Name is Required",
            status: "0",
        });
    }

    if (req.body.password == "") {
        return res.status(200).json({
            message: "password is Required",
            status: "0",
        });
    }




    const payload = {
        email: req.body.email,
        full_name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 10),
    };
    const token = jwt.sign(payload, config.secret, {
        expiresIn: "365d",
    });
    const Userdatavalue = new User({
        email: req.body.email,
        full_name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 10),
        token: token,
    });


    
    await User.create(Userdatavalue, async function (err, result) {
        const user = await User.findOne({ email: req.body.email });
        if (result) {
            return res.status(200).json({
                message: "Success", 
                data : user,
                status: "1",
            });
        } else {
            return res
                .status(200)
                .json({ message: "User Not regester", status: "0" });
        }
    });
}

//  HomePage Api
async function HomePage(req, res) {
    console.log("HomePage", req.body)
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
            "https://" + "api.findup.ai" + "/uploads/product/";
    }
    const FeatureList = await feature.find({ status: "Active" })
    const PricingList = await pricing.find({ status: "Active" })
    const CategoryList = await category.find({ status: "Active", type: "product" })
    const ProductList = await product.find({ status: "Active" }).sort({ _id: -1 })
    // const todayProductCount = await product.find({ status: "Active", created_at: }).sort({_id:-1})

    const filter = [
        {
            Header: "Pricing",
            data: PricingList
        },
        {
            Header: "Features",
            data: FeatureList
        }
    ]
    console.log("filter",PricingList)
    const products = []
    for (let i = 0; ProductList.length > i; ++i) {
        const pricing = await db.Pricing.findOne({ _id: ProductList[i].pricing_category })
        var heartStatus = ""
        console.log("user_id", req.body.user_id)
        if (req.body.user_id != undefined) {
            console.log()
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: ProductList[i].id })
            if (favourites == null) {
                heartStatus = "0"
            } else {
                heartStatus = favourites.heart_status
            }
        }
        console.log("filter",heartStatus)
        products.push({
            title: ProductList[i].title,
            id: ProductList[i].id,
            url: ProductList[i].url,
            heartStatus: heartStatus,
            category: ProductList[i].category,
            short_discription: ProductList[i].short_discription,
            discription: ProductList[i].discription,
            features: ProductList[i].features,
            pricing_category: pricing?.title,
            Favourites_count: ProductList[i]?.Favourites_count,
            verified:ProductList[i].verified,
            price: ProductList[i].price,
            association: ProductList[i].association,
            image: PicUrl + ProductList[i].image,
        })
    }
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todatproductcount = await product.find({ created_at: { $gte: startOfDay, $lt: endOfDay } }).count()

    const todaynewscount = await news.find({ created_at: { $gte: startOfDay, $lt: endOfDay } }).count()


    return res.status(200).json({
        data: products,
        todatproductcount: todatproductcount,
        todaynewscount: todaynewscount,
        category: CategoryList,
        Filter: filter,
        message: "success",
        status: "1"
    })

}

// Detail Page
async function detailPage(req, res) {
    console.log("detailPage", req.body)
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }
    const product = await product.findOne({ _id: req.body.id, status: "Active" })

    const data = {
        title: product.title,
        url: product.url,
        category: product.category,
        short_discription: product.short_discription,
        discription: product.discription,
        features: product.features,
        pricing_category: product.pricing_category,
        price: product.price,
        association: product.association,
        image: PicUrl + product.image,
    }

    const simmilarProductlist = await product.find({ category: product.category }).limit(5)
    const simmilarProduct = []
    for (let i = 0; simmilarProductlist.length > i; ++i) {
        simmilarProduct.push({
            title: simmilarProductlist[i].title,
            url: simmilarProductlist[i].url,
            category: simmilarProductlist[i].category,
            short_discription: simmilarProductlist[i].short_discription,
            discription: simmilarProductlist[i].discription,
            features: simmilarProductlist[i].features,
            pricing_category: simmilarProductlist[i].pricing_category,
            price: simmilarProductlist[i].price,
            association: simmilarProductlist[i].association,
            image: PicUrl + simmilarProductlist[i].image,
        })
    }

    return res.status(200).json({
        data: data,
        simmilarProduct: simmilarProduct,
        message: "success",
        status: "1"
    })
}

//Regex Api
async function RegexApi(req, res) {
    console.log("RegexApi", req.body)

    const productList = await product.find({ title: new RegExp(req.body.title), status: "Active" })
    const categoryList = await category.find({ title: new RegExp(req.body.title), status: "Active" })

    const data = [
        {
            heading: "Category",
            data: categoryList
        },
        {
            heading: "Tools",
            data: productList
        }
    ]

    return res.status(200).json({
        data: data,
        message: "success",
        status: "1"
    })
}

// Favourites Api
async function Favourites(req, res) {
    console.log("Favourites", req.body)

    if (req.body.heart_status == "0") {
        console.log("allready exist");
        await db.Favourites.deleteMany(
            {
                user_id: req.body.user_id,
                product_id: req.body.product_id,
                type: req.body.type
            },
            async function (err, result) {
                if (err) {
                    return res.status(200).json({
                        message: "error",
                        status: "0"
                    })
                } else {
                    if (req.body.type == "product") {
                        console.log("adityawwwwwwwwww")
                        const dataManupulate = await product.findOne({ _id: req.body.product_id })
                        await db.Product.updateOne({ _id: req.body.product_id },
                            {
                                Favourites_count: dataManupulate?.Favourites_count - 1
                            }, function (err, result) {
                                if (result) {
                                    console.log("userId", req.body.user_id)
                                    return res.status(200).json({
                                        userId: req.body.user_id,
                                        message: "Favourite removed Successfully",
                                        status: "1"
                                    })
                                }
                                else {
                                    return res.status(200).json({
                                        message: "error in updating product",
                                        status: "0"
                                    })
                                }
                            })
                    }
                    else {
                        console.log("adityaaaaaaaaaa")
                        const dataManupulate = await news.findOne({ _id: req.body.product_id })
                        await db.News.updateOne({ _id: req.body.product_id },
                            {
                                Favourites_count: dataManupulate?.Favourites_count - 1
                            }, function (err, result) {
                                if (result) {
                                    return res.status(200).json({
                                        userId: req.body.user_id,
                                        message: "Favourite removed Successfully",
                                        status: "1"
                                    })
                                }
                                else {
                                    return res.status(200).json({
                                        message: "error in updating product",
                                        status: "0"
                                    })
                                }
                            })
                    }
                }
            }
        );
    } else {
        console.log("add to wishlist");
        const Favouritestdata = new favourites({
            user_id: req.body.user_id,
            product_id: req.body.product_id,
            heart_status: req.body.heart_status,
            type: req.body.type
        });

        db.Favourites.create(Favouritestdata, async function (err, result) {
            if (result) {
                if (req.body.type == "product") {
                    console.log("adityaeeeeeeeeeeeeeee")
                    const dataManupulate = await product.findOne({ _id: req.body.product_id });
                    let success = false;

                    await db.Product.updateOne({ _id: req.body.product_id }, {
                        Favourites_count: dataManupulate?.Favourites_count + 1
                    }, function (err, result) {
                        if (result) {
                            console.log("userId", req.body.user_id);
                            success = true;
                        }
                    });

                    if (success) {
                        return res.status(200).json({
                            userId: req.body.user_id,
                            message: "Favourite added Successfully",
                            status: "1"
                        });
                    } else {
                        return res.status(200).json({
                            message: "error in updating product",
                            status: "0"
                        });
                    }
                }
                else {
                    console.log("adity")
                    const dataManupulate = await news.findOne({ _id: req.body.product_id })
                    console.log("dataManupulate", dataManupulate)
                    await db.News.updateOne({ _id: req.body.product_id },
                        {
                            Favourites_count: dataManupulate?.Favourites_count + 1
                        }, function (err, result) {
                            if (result) {
                                console.log("userId", req.body.user_id)
                                return res.status(200).json({
                                    userId: req.body.user_id,
                                    message: "Favourite added Successfully",
                                    status: "1"
                                })
                            }
                            else {
                                return res.status(200).json({
                                    message: "error in updating product",
                                    status: "0"
                                })
                            }
                        })
                }
            } else {
                console.log("error", err)
                return res.status(200).json({
                    message: "error",
                    status: "0"
                });
            }
        });

    }
}

// FavouritesList Api
async function favouritesList(req, res) {
    console.log("favouritesList", req.body)
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }
    var productdata = []
    const Favourites_list = await favourites.find({ user_id: req.body.id, status: "Active" })

    for (let j = 0; Favourites_list.length > j; ++j) {

        if (Favourites_list[j]?.type == "product") {
            var ProductList = await product.findOne({ _id: Favourites_list[j]?.product_id, status: "Active" }).sort({ _id: -1 })
        }
        else {
            var ProductList = await news.findOne({ _id: Favourites_list[j]?.product_id, status: "Active" }).sort({ _id: -1 })
        }
        console.log("ProductList", ProductList)
        var HeartStatus = 0;
        if (Favourites_list[j] == null) {
            HeartStatus = 0;
        } else {
            HeartStatus = Favourites_list[j]?.heartstatus;
        }
        productdata.push({
            title: ProductList?.title,
            HeartStatus: HeartStatus,
            url: ProductList?.url,
            category: ProductList?.category,
            type: Favourites_list[j]?.type,
            short_discription: ProductList?.short_discription,
            discription: ProductList?.discription,
            id: ProductList?.id,
            features: ProductList?.features,
            pricing_category: ProductList?.pricing_category,
            price: ProductList?.price,
            association: ProductList?.association,
            Favourites_count: ProductList?.Favourites_count,
            image: PicUrl + ProductList?.image,

        })

    }

    return res.status(200).json({
        data: productdata,
        message: "success",
        status: "1"
    })
}
// dropdown api
async function dropdown(req, res) {
    //  const Category = await category.find()
    //  const features = await feature.find()
    //  const pricings = await pricing.find()

    const dropdown = {
        Category: await category.find({ type: req.body.type }),
        features: await feature.find(),
        pricings: await pricing.find()

    }
    return res.status(200).json({
        data: dropdown,
        message: "success",
        status: "1"
    })
}

async function categoryListbtType(req, res) {
    console.log("categoryListbtType", req.body)

    const data = await category.find({ type: req.body.type }).sort({ _id: -1 });

    return res.status(200).json({
        data: data,
        messgae: "success",
        status: "1"
    })
}

async function newssdata(req, res) {
    console.log("newssdata", req.body)
    const newsdata = await news.find({ status: "Active" })
    var data = []
    var count = []
    for (let i = 0; newsdata.length > i; ++i) {

        var HeartStatus = ""
        if (req.body.user_id != undefined) {
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: newsdata[i].id })
            if (favourites == null) {
                HeartStatus = "0"
            } else {
                HeartStatus = favourites.heart_status
            }
        }
        console.log(moment(newsdata[i]?.created_at).calendar())
        console.log(newsdata[i]?.created_at)

        data.push({
            title: newsdata[i]?.title,
            url: newsdata[i]?.url,
            id: newsdata[i]?.id,
            Favourites_count: newsdata[i]?.Favourites_count,
            HeartStatus: HeartStatus,
            category: newsdata[i]?.category,
            created_at: newsdata[i]?.created_at
        })
    }
    const CategoryList = await category.find({ status: "Active", type: "news" })
    console.log("data", data)
    return res.status(200).json({
        data: data,
        CategoryList: CategoryList,
        messgae: "success",
        status: "1"
    })
}

async function filter(req, res) {
    console.log("filter", req.body)
    const param1 = req.body.category
    const param2 = req.body.pricing
    const param3 = req.body.feature
    let query = {};
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }

    if (param1 && param2 && param3) {
        query = { category: param1, pricing_category: { $in: param2 }, feature: { $in: param2 } };
    } else if (param1 && param2) {
        query = { category: param1, pricing_category: { $in: param2 } };
    } else if (param2 && param3) {
        query = { pricing_category: { $in: param2 }, feature: { $in: param3 } };
    } else if (param1 && param3) {
        query = { category: param1, feature: { $in: param3 } };
    } else if (param1) {
        query = { category: param1 };
    } else if (param2) {
        query = { pricing_category: { $in: param2 } };
    } else if (param3) {
        query = { pricing: { $in: param3 } };
    }
    console.log("query", query)
    const data = await product.find(query)
    console.log("data", data)
    const products = []
    for (let i = 0; data.length > i; ++i) {
        const pricing = await db.Pricing.findOne({ _id: data[i].pricing_category })
        var heartStatus = ""

        if (req.body.user_id != undefined) {
            console.log()
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: data[i].id })
            if (favourites == null) {
                heartStatus = "0"
            } else {
                heartStatus = favourites.heart_status
            }
        }
        products.push({
            title: data[i].title,
            id: data[i].id,
            url: data[i].url,
            heartStatus: heartStatus,
            category: data[i].category,
            short_discription: data[i].short_discription,
            discription: data[i].discription,
            features: data[i].features,
            pricing_category: pricing?.title,
            Favourites_count: data[i]?.Favourites_count,
            price: data[i].price,
            association: data[i].association,
            image: PicUrl + data[i].image,
        })
    }

    const FeatureList = await feature.find({ status: "Active" })
    const PricingList = await pricing.find({ status: "Active" })
    const CategoryList = await category.find({ status: "Active", type: "product" })
    const filter = [
        {
            Header: "Pricing",
            data: PricingList
        },
        {
            Header: "Features",
            data: FeatureList
        }
    ]
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todatproductcount = await product.find({ created_at: { $gte: startOfDay, $lt: endOfDay } }).count()

    const todaynewscount = await news.find({ created_at: { $gte: startOfDay, $lt: endOfDay } }).count()
    return res.status(200).json({
        data: products,
        category: CategoryList,
        Filter: filter,
        todatproductcount: todatproductcount,
        todaynewscount: todaynewscount,
        messgae: "success",
        status: "1"
    })


}

async function discover(req, res) {
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }
    const data = await product.aggregate([{ $sample: { size: 1 } }])
    const features = await feature.findOne({ _id: data[0].features })
    const price = await pricing.findOne({ _id: data[0].pricing_category })
    const categorytitle = await category.findOne({ _id: data[0].category })
    if (req.body.user_id != undefined) {
        console.log()
        var heartStatus = ""
        const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: data[0].id })
        if (favourites == null) {
            heartStatus = "0"
        } else {
            heartStatus = favourites.heart_status
        }
    }
    const productData = {
        title: data[0]?.title,
        url: data[0]?.url,
        heartStatus: heartStatus,
        category: categorytitle.title,
        short_discription: data[0]?.short_discription,
        discription: data[0]?.discription,
        features: features?.title,
        pricing_category: price?.title,
        price: data[0]?.price,
        association: data[0]?.association,
        id: data[0]?._id,
        image: PicUrl + data[0]?.image,
    };
    return res.status(200).json({
        data: productData,
        messgae: "success",
        status: "1"
    })
}

async function todayTools(req, res) {
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    var products = []
    const ProductList = await product.find({ created_at: { $gte: startOfDay, $lt: endOfDay } })

    for (let i = 0; ProductList.length > i; ++i) {
        const pricing = await db.Pricing.findOne({ _id: ProductList[i].pricing_category })
        var heartStatus = ""
        console.log("user_id", req.body.user_id)
        if (req.body.user_id != undefined) {
            console.log()
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: ProductList[i].id })
            if (favourites == null) {
                heartStatus = "0"
            } else {
                heartStatus = favourites.heart_status
            }
        }
        products.push({
            title: ProductList[i].title,
            id: ProductList[i].id,
            url: ProductList[i].url,
            heartStatus: heartStatus,
            category: ProductList[i].category,
            short_discription: ProductList[i].short_discription,
            discription: ProductList[i].discription,
            features: ProductList[i].features,
            pricing_category: pricing?.title,
            Favourites_count: ProductList[i]?.Favourites_count,
            price: ProductList[i].price,
            association: ProductList[i].association,
            image: PicUrl + ProductList[i].image,
        })
    }
    return res.status(200).json({
        data: products,
        messgae: "success",
        status: "1"
    })
}
async function todaynews(req, res) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    var products = []
    const newsdata = await news.find({ created_at: { $gte: startOfDay, $lt: endOfDay } })

    for (let i = 0; newsdata.length > i; ++i) {

        var heartStatus = ""
        console.log("user_id", req.body.user_id)
        if (req.body.user_id != undefined) {
            console.log()
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: newsdata[i].id })
            if (favourites == null) {
                heartStatus = "0"
            } else {
                heartStatus = favourites.heart_status
            }
        }
        products.push({
            title: newsdata[i]?.title,
            url: newsdata[i]?.url,
            id: newsdata[i]?.id,
            Favourites_count: newsdata[i]?.Favourites_count,
            HeartStatus: heartStatus,
            category: newsdata[i]?.category,
            created_at: newsdata[i]?.created_at
        })
    }
    return res.status(200).json({
        data: products,
        messgae: "success",
        status: "1"
    })
}

async function test(req, res) {
    try {
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

        const Products = await product.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startOfWeek,
                        $lte: endOfWeek,
                    },
                },
            },
        ]);

        res.json(Products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function productByCategory(req, res) {
    console.log(req.body)

    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }
    const FeatureList = await feature.find({ status: "Active" })
    const PricingList = await pricing.find({ status: "Active" })
    const CategoryList = await category.find({ status: "Active", type: "product" })
    const ProductList = await product.find({ status: "Active", category: req.body.id }).sort({ _id: -1 })
    // const todayProductCount = await product.find({ status: "Active", created_at: }).sort({_id:-1})

    const filter = [
        {
            Header: "Pricing",
            data: PricingList
        },
        {
            Header: "Features",
            data: FeatureList
        }
    ]
    const products = []
    for (let i = 0; ProductList.length > i; ++i) {
        const pricing = await db.Pricing.findOne({ _id: ProductList[i].pricing_category })
        var heartStatus = ""
        console.log("user_id", req.body.user_id)
        if (req.body.user_id != undefined) {
            console.log()
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: ProductList[i].id })
            if (favourites == null) {
                heartStatus = "0"
            } else {
                heartStatus = favourites.heart_status
            }
        }
        products.push({
            title: ProductList[i].title,
            id: ProductList[i].id,
            url: ProductList[i].url,
            heartStatus: heartStatus,
            category: ProductList[i].category,
            short_discription: ProductList[i].short_discription,
            discription: ProductList[i].discription,
            features: ProductList[i].features,
            pricing_category: pricing?.title,
            Favourites_count: ProductList[i]?.Favourites_count,
            price: ProductList[i].price,
            association: ProductList[i].association,
            image: PicUrl + ProductList[i].image,
        })
    }

    return res.status(200).json({
        data: products,
        category: CategoryList,
        Filter: filter,
        message: "success",
        status: "1"
    })
}

async function sorting(req, res) {
    if (__dirname == "/jinni/backend/jinni/controllers") {
        var PicUrl = `${process.env.URL}/uploads/product/`;
    } else {
        var PicUrl =
        "https://" + "api.findup.ai" + "/uploads/product/";
    }
    console.log("sosorting", req.body)
    var ProductList = []
    if (req.body.sort == "Verified") {
        ProductList = await product.find({ status: "Active", verified: "verified" }).sort({ _id: -1 })
    }
    else if (req.body.sort == "New") {
        ProductList = await product.find({ status: "Active" }).sort({ _id: -1 })
    }
    else if (req.body.sort == "Popular") {
        ProductList = await product.find({ status: "Active" }).sort({ Favourites_count: -1 })
    }
    const FeatureList = await feature.find({ status: "Active" })
    const PricingList = await pricing.find({ status: "Active" })
    const CategoryList = await category.find({ status: "Active", type: "product" })

    const filter = [
        {
            Header: "Pricing",
            data: PricingList
        },
        {
            Header: "Features",
            data: FeatureList
        }
    ]
    const products = []
    for (let i = 0; ProductList.length > i; ++i) {
        const pricing = await db.Pricing.findOne({ _id: ProductList[i].pricing_category })
        var heartStatus = ""
        console.log("user_id", req.body.user_id)
        if (req.body.user_id != undefined) {
            console.log()
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: ProductList[i].id })
            if (favourites == null) {
                heartStatus = "0"
            } else {
                heartStatus = favourites.heart_status
            }
        }
        products.push({
            title: ProductList[i].title,
            id: ProductList[i].id,
            url: ProductList[i].url,
            heartStatus: heartStatus,
            category: ProductList[i].category,
            short_discription: ProductList[i].short_discription,
            discription: ProductList[i].discription,
            features: ProductList[i].features,
            pricing_category: pricing?.title,
            Favourites_count: ProductList[i]?.Favourites_count,
            price: ProductList[i].price,
            association: ProductList[i].association,
            image: PicUrl + ProductList[i].image,
        })
    }
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todatproductcount = await product.find({ created_at: { $gte: startOfDay, $lt: endOfDay } }).count()

    const todaynewscount = await news.find({ created_at: { $gte: startOfDay, $lt: endOfDay } }).count()

    return res.status(200).json({
        data: products,
        todatproductcount: todatproductcount,
        todaynewscount: todaynewscount,
        category: CategoryList,
        Filter: filter,
        message: "success",
        status: "1"
    })

}

async function byTime(req, res) {
    console.log("byTime", req.body)
    var todaynewscount = []
    if (req.body.sort == "Week") {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const startOfWeek = new Date(today); // Make a copy of today's date
        startOfWeek.setDate(today.getDate() - dayOfWeek); // Set the start date to Sunday

        const endOfWeek = new Date(today); // Make another copy of today's date
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
        todaynewscount = await news.find({ created_at: { $gte: startOfWeek, $lt: endOfWeek } })
    }
    else if (req.body.sort == "Month") {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const startOfMonth = new Date(year, month, 1); // Set the start date to the first day of the month
        const endOfMonth = new Date(year, month + 1, 0);
        todaynewscount = await news.find({ created_at: { $gte: startOfMonth, $lt: endOfMonth } })
    }
    else if (req.body.sort == "Today") {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        todaynewscount = await news.find({ created_at: { $gte: startOfDay, $lt: endOfDay } })
    }
    else if (req.body.sort == "All") {
        todaynewscount = await news.find({ status: "Active" })
    }
    var data = []
    var count = []
    for (let i = 0; todaynewscount.length > i; ++i) {

        var HeartStatus = ""
        if (req.body.user_id != undefined) {
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: todaynewscount[i].id })
            if (favourites == null) {
                HeartStatus = "0"
            } else {
                HeartStatus = favourites.heart_status
            }
        }
        console.log(moment(todaynewscount[i]?.created_at).calendar())
        console.log(todaynewscount[i]?.created_at)

        data.push({
            title: todaynewscount[i]?.title,
            url: todaynewscount[i]?.url,
            id: todaynewscount[i]?.id,
            Favourites_count: todaynewscount[i]?.Favourites_count,
            HeartStatus: HeartStatus,
            category: todaynewscount[i]?.category,
            created_at: todaynewscount[i]?.created_at
        })
    }
    const CategoryList = await category.find({ status: "Active", type: "news" })
    return res.status(200).json({
        data: data,
        CategoryList: CategoryList,
        message: "success",
        status: "1"
    })
}
async function byCategory(req, res) {
    console.log("byCategory", req.body)

    const todaynewscount = await news.find({ category: req.body.category })

    var data = []
    var count = []
    for (let i = 0; todaynewscount.length > i; ++i) {

        var HeartStatus = ""
        if (req.body.user_id != undefined) {
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: todaynewscount[i].id })
            if (favourites == null) {
                HeartStatus = "0"
            } else {
                HeartStatus = favourites.heart_status
            }
        }
        console.log(moment(todaynewscount[i]?.created_at).calendar())
        console.log(todaynewscount[i]?.created_at)

        data.push({
            title: todaynewscount[i]?.title,
            url: todaynewscount[i]?.url,
            id: todaynewscount[i]?.id,
            Favourites_count: todaynewscount[i]?.Favourites_count,
            HeartStatus: HeartStatus,
            category: todaynewscount[i]?.category,
            created_at: todaynewscount[i]?.created_at
        })
    }
    const CategoryList = await category.find({ status: "Active", type: "news" })
    return res.status(200).json({
        data: data,
        CategoryList: CategoryList,
        message: "success",
        status: "1"
    })
}
async function newsSorting(req, res) {
    var newslist = []
    if (req.body.sort == "Verified") {
        todaynewscount = await product.find({ status: "Active", verified: "verified" }).sort({ _id: -1 })
    }
    else if (req.body.sort == "New") {
        todaynewscount = await product.find({ status: "Active" }).sort({ _id: -1 })
    }
    else if (req.body.sort == "Popular") {
        todaynewscount = await product.find({ status: "Active" }).sort({ Favourites_count: -1 })
    }
    const CategoryList = await category.find({ status: "Active", type: "news" })

    var data = []
    var count = []
    for (let i = 0; todaynewscount.length > i; ++i) {

        var HeartStatus = ""
        if (req.body.user_id != undefined) {
            const favourites = await db.Favourites.findOne({ user_id: req.body.user_id, product_id: todaynewscount[i].id })
            if (favourites == null) {
                HeartStatus = "0"
            } else {
                HeartStatus = favourites.heart_status
            }
        }
        console.log(moment(todaynewscount[i]?.created_at).calendar())
        console.log(todaynewscount[i]?.created_at)

        data.push({
            title: todaynewscount[i]?.title,
            url: todaynewscount[i]?.url,
            id: todaynewscount[i]?.id,
            Favourites_count: todaynewscount[i]?.Favourites_count,
            HeartStatus: HeartStatus,
            category: todaynewscount[i]?.category,
            created_at: todaynewscount[i]?.created_at
        })
    }


    return res.status(200).json({
        data: todaynewscount,
        CategoryList: CategoryList,
        message: "success",
        status: "1"
    })
}
async function  adminDashboard (req,res){
    const products = await product.find().count()
    const users = await User.find().count()
    const newss = await news.find().count()
    const newsletters = await blog.find().count()
    const categories = await category.find().count()
    const comments = await comment.find().count()

    return res.status(200).json({
        products: products,
        users: users,
        newss: newss,
        newsletters: newsletters,
        categories: categories,
        comments: comments,
        message: "success",
        status: "1"
    })
}