import * as api from "@3dverse/api";

const YOUR_API_KEY = "62ccfc12-66ff-404d-be22-44d86d6de9f8.5R5aVITtct3GzjVK0BDgWrE4XgCMZt944n1JTXbuYKc";

api.setApiKey(YOUR_API_KEY);

async function example() {
    // Register a user
    const { data: user } = await api.registerUser({
        username: "David",
    });

    // Generate a user token
    const { data: userToken } = await api.generateUserToken({
        user_id: user.user_id,
        scope: "manage",
    });

    // Create a folder
    const { data: folder } = await api.createFolder({
        name: "New_folder",
    });

    // Grant "manage" access to the folder
    await api.grantMemberAccessToFolder({
        member_type: "users",
        folder_id: folder.folder_id,
        member_id: user.user_id,
        access: "manage",
    });
}