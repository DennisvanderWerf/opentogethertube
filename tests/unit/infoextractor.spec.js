const InfoExtract = require("../../infoextract");
const storage = require("../../storage");
const { CachedVideo } = require("../../models");

const youtubeVideoListSampleResponses = {
  "BTZ5KVRUy1Q": '{"kind": "youtube#videoListResponse","etag": "\\"j6xRRd8dTPVVptg711_CSPADRfg/dqnBDym87ibK6816BZIGb9MCLYI\\"","pageInfo": {"totalResults": 1,"resultsPerPage": 1},"items": [{"kind": "youtube#video","etag": "\\"j6xRRd8dTPVVptg711_CSPADRfg/UyysisXjek5qf_mfkU7W8pFnmPs\\"","id": "BTZ5KVRUy1Q","snippet": {"publishedAt": "2019-08-26T11:32:44.000Z","channelId": "UCsLiV4WJfkTEHH0b9PmRklw","title": "tmpIwT4T4","description": "tmpIwT4T4","thumbnails": {"default": {"url": "https://i.ytimg.com/vi/BTZ5KVRUy1Q/default.jpg","width": 120,"height": 90},"medium": {"url": "https://i.ytimg.com/vi/BTZ5KVRUy1Q/mqdefault.jpg","width": 320,"height": 180},"high": {"url": "https://i.ytimg.com/vi/BTZ5KVRUy1Q/hqdefault.jpg","width": 480,"height": 360},"standard": {"url": "https://i.ytimg.com/vi/BTZ5KVRUy1Q/sddefault.jpg","width": 640,"height": 480}},"channelTitle": "Webdriver Torso","categoryId": "22","liveBroadcastContent": "none","localized": {"title": "tmpIwT4T4","description": "tmpIwT4T4"}},"contentDetails": {"duration": "PT10S","dimension": "2d","definition": "sd","caption": "false","licensedContent": true,"projection": "rectangular"}}]}',
  "I3O9J02G67I": '{"kind": "youtube#videoListResponse","etag": "\\"j6xRRd8dTPVVptg711_CSPADRfg/Ly8EM_vOONCLOEzI8TMYnzfG37k\\"","pageInfo": {"totalResults": 1,"resultsPerPage": 1},"items": [{"kind": "youtube#video","etag": "\\"j6xRRd8dTPVVptg711_CSPADRfg/Xz7huLjXglgWYbMv-lMOshzynvk\\"","id": "I3O9J02G67I","snippet": {"publishedAt": "2019-07-26T13:02:54.000Z","channelId": "UCsLiV4WJfkTEHH0b9PmRklw","title": "tmpATT2Cp","description": "tmpATT2Cp","thumbnails": {"default": {"url": "https://i.ytimg.com/vi/I3O9J02G67I/default.jpg","width": 120,"height": 90},"medium": {"url": "https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg","width": 320,"height": 180},"high": {"url": "https://i.ytimg.com/vi/I3O9J02G67I/hqdefault.jpg","width": 480,"height": 360},"standard": {"url": "https://i.ytimg.com/vi/I3O9J02G67I/sddefault.jpg","width": 640,"height": 480}},"channelTitle": "Webdriver Torso","categoryId": "22","liveBroadcastContent": "none","localized": {"title": "tmpATT2Cp","description": "tmpATT2Cp"}},"contentDetails": {"duration": "PT10S","dimension": "2d","definition": "sd","caption": "false","licensedContent": false,"projection": "rectangular"}}]}',
};

describe('InfoExtractor Link Parsing', () => {
  it('getService() should return youtube when given youtube link', () => {
    expect(InfoExtract.getService("http://youtube.com/watch?v=I3O9J02G67I")).toEqual("youtube");
    expect(InfoExtract.getService("http://www.youtube.com/watch?v=I3O9J02G67I")).toEqual("youtube");
    expect(InfoExtract.getService("https://youtube.com/watch?v=I3O9J02G67I")).toEqual("youtube");
    expect(InfoExtract.getService("https://www.youtube.com/watch?v=I3O9J02G67I")).toEqual("youtube");
    expect(InfoExtract.getService("https://m.youtube.com/watch?v=I3O9J02G67I")).toEqual("youtube");
    expect(InfoExtract.getService("http://youtu.be/I3O9J02G67I")).toEqual("youtube");
    expect(InfoExtract.getService("https://youtu.be/I3O9J02G67I")).toEqual("youtube");
  });

  it('getService() should return false when given link to unsupported service', () => {
    expect(InfoExtract.getService("http://example.com")).toEqual(false);
  });

  it('getService() should return false when given invalid string', () => {
    expect(InfoExtract.getService("funny man")).toEqual(false);
    expect(InfoExtract.getService("youtube.com epic fail compilation")).toEqual(false);
    expect(InfoExtract.getService("")).toEqual(false);
  });

  it('getService() should return false when given null', () => {
    expect(InfoExtract.getService(null)).toEqual(false);
  });

  it('getService() should return false when given undefined', () => {
    expect(InfoExtract.getService(undefined)).toEqual(false);
  });

  it('getVideoIdYoutube() should return correct id when given youtube link', () => {
    expect(InfoExtract.getVideoIdYoutube("http://youtube.com/watch?v=I3O9J02G67I")).toEqual("I3O9J02G67I");
    expect(InfoExtract.getVideoIdYoutube("http://www.youtube.com/watch?v=I3O9J02G67I")).toEqual("I3O9J02G67I");
    expect(InfoExtract.getVideoIdYoutube("https://youtube.com/watch?v=I3O9J02G67I")).toEqual("I3O9J02G67I");
    expect(InfoExtract.getVideoIdYoutube("https://www.youtube.com/watch?v=I3O9J02G67I")).toEqual("I3O9J02G67I");
    expect(InfoExtract.getVideoIdYoutube("https://m.youtube.com/watch?v=I3O9J02G67I")).toEqual("I3O9J02G67I");
    expect(InfoExtract.getVideoIdYoutube("http://youtu.be/I3O9J02G67I")).toEqual("I3O9J02G67I");
    expect(InfoExtract.getVideoIdYoutube("https://youtu.be/I3O9J02G67I")).toEqual("I3O9J02G67I");
  });
});

describe('InfoExtractor Caching Spec', () => {
  beforeEach(async () => {
    console.warn("CLEAR CACHE");
    await CachedVideo.destroy({ where: {} });
  }),

  afterEach(async () => {

  }),

  it('should get the correct video metadata', done => {
    InfoExtract.YtApi.get = jest.fn().mockReturnValue(new Promise(resolve => resolve({ status: 200, data: JSON.parse(youtubeVideoListSampleResponses["BTZ5KVRUy1Q"]) })));

    InfoExtract.getVideoInfo("youtube", "BTZ5KVRUy1Q").then(video => {
      expect(video).toBeDefined();
      expect(video.service).toBeDefined();
      expect(video.service).toBe("youtube");
      expect(video.serviceId).toBeUndefined();
      expect(video.id).toBeDefined();
      expect(video.id).toBe("BTZ5KVRUy1Q");
      expect(video.title).toBeDefined();
      expect(video.title).toBe("tmpIwT4T4");
      expect(video.description).toBeDefined();
      expect(video.description).toBe("tmpIwT4T4");
      expect(video.thumbnail).toBeDefined();
      expect(video.thumbnail).toBe("https://i.ytimg.com/vi/BTZ5KVRUy1Q/mqdefault.jpg");
      expect(video.length).toBeDefined();
      expect(video.length).toBe(10);

      expect(InfoExtract.YtApi.get).toBeCalled();
      done();
    }).catch(err => done.fail(err));
  });

  it('should miss cache, get the correct video metadata, and store it in the cache', async done => {
    InfoExtract.YtApi.get = jest.fn().mockReturnValue(new Promise(resolve => resolve({ status: 200, data: JSON.parse(youtubeVideoListSampleResponses["I3O9J02G67I"]) })));

    await expect(CachedVideo.findOne({ where: { service: "youtube", serviceId: "I3O9J02G67I" }})).resolves.toBeNull();

    InfoExtract.getVideoInfo("youtube", "I3O9J02G67I").then(async video => {
      expect(video).toBeDefined();
      expect(video.service).toBeDefined();
      expect(video.service).toBe("youtube");
      expect(video.serviceId).toBeUndefined();
      expect(video.id).toBeDefined();
      expect(video.id).toBe("I3O9J02G67I");
      expect(video.title).toBeDefined();
      expect(video.title).toBe("tmpATT2Cp");
      expect(video.description).toBeDefined();
      expect(video.description).toBe("tmpATT2Cp");
      expect(video.thumbnail).toBeDefined();
      expect(video.thumbnail).toBe("https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg");
      expect(video.length).toBeDefined();
      expect(video.length).toBe(10);

      await expect(CachedVideo.count()).resolves.toEqual(1);
      await expect(CachedVideo.findOne({ where: { service: "youtube", serviceId: "I3O9J02G67I" }})).resolves.toBeDefined();

      expect(InfoExtract.YtApi.get).toBeCalled();
      done();
    }).catch(err => done.fail(err));
  });

  it('should hit cache, get the correct video metadata from the cache', async done => {
    await expect(CachedVideo.count()).resolves.toEqual(0);

    await expect(CachedVideo.create({
      service: "fakeservice",
      serviceId: "abc123",
      title: "Test Title",
      description: "This is a test description.",
      thumbnail: "http://example.com/thumbnail.jpg",
      length: 32,
    })).resolves.toBeDefined();

    await expect(CachedVideo.count()).resolves.toEqual(1);

    InfoExtract.getVideoInfo("fakeservice", "abc123").then(async video => {
      expect(video).toBeDefined();
      expect(video.service).toBeDefined();
      expect(video.service).toBe("fakeservice");
      expect(video.serviceId).toBeUndefined();
      expect(video.id).toBeDefined();
      expect(video.id).toBe("abc123");
      expect(video.title).toBeDefined();
      expect(video.title).toBe("Test Title");
      expect(video.description).toBeDefined();
      expect(video.description).toBe("This is a test description.");
      expect(video.thumbnail).toBeDefined();
      expect(video.thumbnail).toBe("http://example.com/thumbnail.jpg");
      expect(video.length).toBeDefined();
      expect(video.length).toBe(32);

      await expect(CachedVideo.count()).resolves.toEqual(1);
      await expect(CachedVideo.findOne({ where: { service: "fakeservice", serviceId: "abc123" }})).resolves.toBeDefined();
      done();
    }).catch(err => done.fail(err));
  });

  it('should partially hit cache, get the missing video metadata (length), and store it in the cache', async done => {
    InfoExtract.getVideoInfoYoutube = jest.fn().mockReturnValue(new Promise(resolve => resolve({ "I3O9J02G67I": { service: "youtube", id: "I3O9J02G67I", length: 10 } })));

    await expect(CachedVideo.findOne({ where: { service: "youtube", serviceId: "I3O9J02G67I" }})).resolves.toBeNull();

    await expect(CachedVideo.create({
      service: "youtube",
      serviceId: "I3O9J02G67I",
      title: "tmpATT2Cp",
      description: "tmpATT2Cp",
      thumbnail: "https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg",
    })).resolves.toBeDefined();

    await CachedVideo.findOne({ where: { service: "youtube", serviceId: "I3O9J02G67I" }}).then(result => {
      expect(result).toBeDefined();
      expect(result.length).toBeNull();
    });

    InfoExtract.getVideoInfo("youtube", "I3O9J02G67I").then(async video => {
      expect(InfoExtract.getVideoInfoYoutube).toBeCalledWith(["I3O9J02G67I"], ["length"]);

      expect(video).toBeDefined();
      expect(video.service).toBeDefined();
      expect(video.service).toBe("youtube");
      expect(video.serviceId).toBeUndefined();
      expect(video.id).toBeDefined();
      expect(video.id).toBe("I3O9J02G67I");
      expect(video.title).toBeDefined();
      expect(video.title).toBe("tmpATT2Cp");
      expect(video.description).toBeDefined();
      expect(video.description).toBe("tmpATT2Cp");
      expect(video.thumbnail).toBeDefined();
      expect(video.thumbnail).toBe("https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg");
      expect(video.length).toBeDefined();
      expect(video.length).toBe(10);

      await expect(CachedVideo.count()).resolves.toEqual(1);
      await expect(CachedVideo.findOne({ where: { service: "youtube", serviceId: "I3O9J02G67I" }})).resolves.toBeDefined();
      done();
    }).catch(err => done.fail(err));
  });
});

describe('InfoExtractor Partial Data Retrieval', () => {
  it('should detect if length is missing from the cached video info', done => {
    storage.getVideoInfo = jest.fn().mockReturnValue(new Promise(resolve => resolve({
      "service": "youtube",
      "id": "I3O9J02G67I",
      "title": "tmpATT2Cp",
      "description": "tmpATT2Cp",
      "thumbnail": "https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg",
    })));
    InfoExtract.getVideoInfoYoutube = jest.fn().mockReturnValue(new Promise(resolve => resolve({ "I3O9J02G67I": { service: "youtube", id: "I3O9J02G67I", length: 10 } })));

    InfoExtract.getVideoInfo("youtube", "I3O9J02G67I").then(video => {
      expect(InfoExtract.getVideoInfoYoutube).toBeCalledWith(["I3O9J02G67I"], ["length"]);
      expect(video).toBeDefined();
      done();
    });
  });

  it('should detect if title is missing from the cached video info', done => {
    storage.getVideoInfo = jest.fn().mockReturnValue(new Promise(resolve => resolve({
      "service": "youtube",
      "id": "I3O9J02G67I",
      "description": "tmpATT2Cp",
      "thumbnail": "https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg",
      "length": 10,
    })));
    InfoExtract.getVideoInfoYoutube = jest.fn().mockReturnValue(new Promise(resolve => resolve({ "I3O9J02G67I": { service: "youtube", id: "I3O9J02G67I", title: "tmpATT2Cp" } })));

    InfoExtract.getVideoInfo("youtube", "I3O9J02G67I").then(video => {
      expect(InfoExtract.getVideoInfoYoutube).toBeCalledWith(["I3O9J02G67I"], ["title"]);
      expect(video).toBeDefined();
      done();
    });
  });

  it('should detect if title and description is missing from the cached video info', done => {
    storage.getVideoInfo = jest.fn().mockReturnValue(new Promise(resolve => resolve({
      "service": "youtube",
      "id": "I3O9J02G67I",
      "thumbnail": "https://i.ytimg.com/vi/I3O9J02G67I/mqdefault.jpg",
      "length": 10,
    })));
    InfoExtract.getVideoInfoYoutube = jest.fn().mockReturnValue(new Promise(resolve => resolve({ "I3O9J02G67I": { service: "youtube", id: "I3O9J02G67I", title: "tmpATT2Cp", description: "tmpATT2Cp" } })));

    InfoExtract.getVideoInfo("youtube", "I3O9J02G67I").then(video => {
      expect(InfoExtract.getVideoInfoYoutube).toBeCalledWith(["I3O9J02G67I"], [
        "title",
        "description",
      ]);
      expect(video).toBeDefined();
      done();
    });
  });
});
