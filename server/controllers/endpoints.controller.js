import WebsiteTick from '../models/websiteTick.model.js';
import Website from '../models/website.model.js';

export const createWeb = async (req, res) => {
    const userId = req.user;
    const { url } = req.body;

    try {
        const website = await Website.create({ url, userId });
        res.json({ status:true, id: website._id });
    } catch (error) {
        res.status(500).json({ status:false, message: "Error creating" });
    }
};

export const getStatus = async (req, res) => {
    const userId = req.user;
    const websiteId = req.query.websiteId;

    try {    
        const website = await Website.findOne({ _id: websiteId, userId, disabled: false });
        if (!website) return res.status(404).json({ message: "Website not found" });

        const ticks = await WebsiteTick.find({ websiteId });
        res.json({ status:true, ...website.toObject(), ticks });
    } catch (error) {
        res.status(500).json({ status:false, message: "Error fetching status" });
    }
};
  

export const getWebsites = async (req, res) => {
    const userId = req.user;

    try {
        const websites = await Website.find({ userId, disabled: false });

        const websitesWithTicks = await Promise.all(websites.map(async (website) => {
            const ticks = await WebsiteTick.find({ websiteId: website._id });
            return { ...website.toObject(), ticks };
        }));
        res.json({ status:true, websites: websitesWithTicks });
    } catch (error) {
        res.status(500).json({ status:false, message: "Error fetching websites" });
    }

};

export const deleteWeb = async (req, res) => {
    const websiteId = req.body.websiteId;
    const userId = req.user;

    await Website.updateOne({ _id: websiteId, userId }, { $set: { disabled: true } });
    res.json({ status:true, message: "Deleted website successfully" });
};

  