<template>
  <div>
    <h2>{{ this.articleInfo.id ? "编辑文章" : "新增文章" }}</h2>

    <a-row style="margin-left: 10px" :gutter="16">
      <!-- <a-col :span="5"> -->
      <!-- <a-card hoverable> -->
      <a-col :span="5">
        <img
          style="max-width: 100%"
          :src="articleInfo.img ? articleInfo.img : defaultImg"
        />
      </a-col>

      <a-col :span="15">
        <h2>{{ articleInfo.title }}</h2>

        <div>
          <span
            >标签：<a-tag v-for="item in selectTags" :key="item" color="#f50">{{
              tagsMap.get(item)
            }}</a-tag></span
          >
          <p>{{ articleInfo.desc }}</p>
        </div>

        <a-button icon="edit" @click="onEditArticleSummary">
          编辑摘要
        </a-button>
      </a-col>
    </a-row>

    <a-row>
      <a-card title="" :bordered="false">
        <mavon-editor
          style="min-height: 600px; z-index: 1000"
          v-model="articleInfo.content"
          :navigation="false"
          :autofocus="true"
          @save="onSaveArticle"
          :externalLink="externalLink"
        />
      </a-card>
    </a-row>

    <!-- 编辑文章摘要 -->
    <a-modal
      v-model="editArticleVisible"
      title="编辑文章摘要"
      ok-text="确认"
      cancel-text="取消"
      :z-index="1000"
      @ok="editArticleSummaryOk"
      @cancel="editArticleSummaryCancel"
    >
      <a-form-model :model="articleInfo" :rules="articleRules" ref="addUserRef">
        <a-form-model-item label="标题" prop="title" has-feedback>
          <a-input v-model="articleInfo.title"></a-input>
        </a-form-model-item>
        <a-form-model-item label="标签" prop="cid" has-feedback>
          <!-- <a-input v-model="articleInfo.cid"></a-input> -->
          <a-select
            mode="multiple"
            :default-value="[]"
            style="width: 100%"
            placeholder="请选择文章标签"
            v-model="selectTags"
            @change="selectTagsChange"
          >
            <a-select-option v-for="item in tagsList" :key="item.ID">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="描述" prop="desc" has-feedback>
          <a-textarea
            v-model="articleInfo.desc"
            placeholder="文章描述"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-model-item>

        <a-form-model-item label="img" prop="img">
          <a-upload
            style="width: 100%; z-index: 0"
            name="avatar"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :customRequest="uploadImg"
          >
            <img
              v-if="this.articleInfo.img"
              :src="this.articleInfo.img"
              style="width: 100%; height: 100%"
              alt="avatar"
            />
            <div v-else>
              <a-icon :type="loading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

export default {
  props: ["id"],
  data() {
    return {
      loading: false,
      imageUrl: "",

      defaultImg: "http://img.wahaoo.online/blog/default.png",
      tagsList: [],
      tagsMap: new Map(),
      currentTags: [],
      selectTags: [],
      editArticleVisible: false,
      markdownOption: {
        // bold: true, // 粗体
      },
      queryParams: {},
      articleInfo: {
        id: 0,
        title: "",
        desc: "",
        content: "",
        img: "",
      },
      articleRules: {
        title: [
          {
            required: true,
            message: "请输入标题!",
            trigger: "blur",
          },
          {
            pattern: /^.{1,50}$/,
            message: "请输入1-50字符的文章标题",
            trigger: "blur",
          },
        ],
        desc: [
          {
            required: true,
            message: "请输入描述!",
            trigger: "blur",
          },
          {
            pattern: /^.{1,200}$/,
            message: "请输入1-200字符的文章描述",
            trigger: "blur",
          },
        ],
      },
      externalLink: {
        markdown_css: false,
        katex_css: false,
        katex_js: function () {
          return "https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js";
        },
      },
    };
  },
  created() {
    if (this.id == undefined) {
      this.articleInfo.id = 0;
    } else {
      this.articleInfo.id = Number(this.id);
      this.getArticleInfo();
    }
    this.getTagsList();
  },
  computed: {},
  methods: {
    // 上传图片
    async uploadImg(data) {
      this.loading = true;
      let param = new FormData();
      param.append("file", data.file);
      let config = {
        headers: { "Content-Type": "multipart/form-data" },
      };
      const res = await this.$http.post("upload", param, config);

      if (res.data.status != 200) {
        return this.$message.error(res.data.message);
      }
      this.articleInfo.img = res.data.url;
      this.$message.success("上传成功");

      this.loading = false;
    },
    beforeUpload(file) {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        this.$message.error("You can only upload JPG file!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("Image must smaller than 2MB!");
      }
      return isJpgOrPng && isLt2M;
    },

    onEditArticleSummary() {
      this.editArticleVisible = true;
    },
    editArticleSummaryOk() {
      this.onSaveArticle();
      this.editArticleVisible = false;
    },
    editArticleSummaryCancel() {
      this.editArticleVisible = false;
    },
    selectTagsChange(value) {
      console.log(value);
      console.log(this.selectTags);
    },

    async getTagsList() {
      const { data: res } = await this.$http.get("tags", {
        params: {},
      });
      if (res.status !== 200) {
        return this.message.error(res.message);
      }
      this.tagsList = res.data;
      for (let index = 0; index < this.tagsList.length; index++) {
        this.tagsMap.set(this.tagsList[index].ID, this.tagsList[index].name);
      }
      console.log("getTagsList", this.tagsList);
    },
    // 获得单个文章信息
    async getArticleInfo() {
      const { data: res } = await this.$http.get(
        `article/${this.articleInfo.id}`
      );
      if (res.status !== 200) {
        return this.message.error(res.message);
      }
      console.log("getArticleInfo  res", res);
      this.articleInfo.id = res.article.ID;
      this.articleInfo.title = res.article.title;
      this.articleInfo.desc = res.article.desc;
      this.articleInfo.content = res.article.content;
      this.articleInfo.img = res.article.img;

      if (res.tags != null) {
        this.currentTags = res.tags;
        for (let index = 0; index < this.currentTags.length; index++) {
          const element = this.currentTags[index];
          this.selectTags.push(element.ID);
        }
      }

      // console.log("this.articleInfo", this.articleInfo);
    },

    async saveNewArticle() {
      if (this.articleInfo.title == "") {
        return this.$message.error("请至少填写文章摘要");
      }

      if ((await this.saveAddArticleInfo()) != 200) return;
      if ((await this.saveArticleTags()) != 200) return;

      this.$message.success("保存成功");
    },

    async saveEditArticle() {
      console.log("saveEditArticle");
      if ((await this.saveEditArticleInfo()) != 200) return;
      console.log("saveEditArticle");
      if ((await this.saveArticleTags().then()) != 200) return;
      this.$message.success("保存成功");
      console.log("saveEditArticle");
    },

    async saveEditArticleInfo() {
      const { data: res } = await this.$http.put(
        `article/${this.articleInfo.id}`,
        this.articleInfo
      );
      console.log("saveEditArticleInfo", res);
      if (res.status != 200) {
        this.$message.error(res.message);
      }
      return res.status;
    },

    async saveAddArticleInfo() {
      const { data: res } = await this.$http.post(
        `article/add`,
        this.articleInfo
      );
      console.log("saveAddArticleInfo", res);
      if (res.status != 200) {
        this.$message.error(res.message);
      }
      this.articleInfo.id = res.data.ID;
      return res.status;
    },

    async saveArticleTags() {
      const { data: res } = await this.$http.put(
        `articletag/update/${this.articleInfo.id}`,
        { tags: this.selectTags.join(",") }
      );
      if (res.status != 200) {
        this.$message.error(res.message);
      }
      return res.status;
    },

    async onSaveArticle() {
      console.log("this.articleInfo.id", this.articleInfo.id);
      if (this.articleInfo.id == 0) {
        this.saveNewArticle();
      } else {
        this.saveEditArticle();
      }
    },
  },
};
</script>

<style scoped>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>