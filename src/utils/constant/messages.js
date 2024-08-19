const generateMessages = (entity) => ({
    notFound: `${entity} not found`,
    alreadyExist: `${entity} already exist`,
    failToCreate: `fail to create ${entity}`,
    failToUpdate: `fail to update ${entity}`,
    failToDelete: `fail to delete ${entity}`,
    createdSuccessfully: `${entity} created successfully`,
    updatedSuccessfully: `${entity} updated successfully`,
    deletedSuccessfully: `${entity} deleted successfully`,
    invalidCredentials: `invalid credentials`,
    addedSuccessfully: `${entity} added successfully`,
    notActive: `${entity} must log in first`,
    notAuthorized: `not authorized`,
    
})
export const messages = {
    category: generateMessages('category'),
    subcategory: generateMessages('subcategory'),
    brand: generateMessages('brand'),
    product: generateMessages('product'),
    wishlist: generateMessages('wishlist'),
    user: {...generateMessages('user'),verifyAccount:"account verified successfully"},
    image: {...generateMessages('image'),required:'file is required'},
    review:generateMessages('review'),
    coupon:generateMessages('coupon'),
    order:generateMessages('order')
}