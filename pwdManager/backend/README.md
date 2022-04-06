## File

### 文件结构

#### HEAD

文件头定义了文件的原始信息，不加密

* 【1字节】 版本号，当前为 `0x01`
  
* 【4字节】 数据部分的偏移量（文件头大小），类型：`uint32`

* 【2字节】 collection数量，类型：`uint16`

* 【22字节】 数据库的uuid，由python的shortuuid库生成，如：`NS3Am8BDHTf3VfMdMgDN4a`

* 【64字节】 数据部分的sha-256的哈希值，用于校验是否损坏，例`64c20eba20e4c944f3f30fca155ad3b1733342690660839027a22f1a90e08bb8`


#### DATA

该部分存储数据经aes加密的数据，加密前的原数据为包含数据库所有信息的json格式字符串

### 数据json结构

最外层为数据库的基本信息，包含：
* `name` 数据库名称，由用户指定，默认为文件名
* `uuid` 数据库的uuid
* `pwdCollectionIdList` collection的uuid组成的list，决定了collection的顺序，排序也只用在该部分调整即可
* `pwdCollectionDict` collection详细信息的字典，以collection的uuid为键

`pwdCollectionDict` 部分结构与外层结构类似，包含`name`、`uuid`、`idList`、`pwdDict` 四部分

`pwdDict` 以每个密码信息的uuid为键，内部结构可能包含，必须的属性有标注

* `name` 密码名称

* `uuid` 该密码的uuid **（必须）**

* `username`  密码对应网站的用户名

* `password`  密码 **（必须）**

* `description`  对密码的描述

* `url`  密码对应网站的url

* `updateTime`  上次更新密码的时间，格式 `yyyy-mm-dd`

* `createTime`  密码的创建时间:  `yyyy-mm-dd`

* `updateHistory`  历史密码:  `List(maxlength: 10)`

* `autoUpdate`  是否需要密码更新提醒:  `Bool`

* `updateDate`  密码更新提醒时间:  `yyyy-mm-dd`

* `autoComplete`  是否需要浏览器自动完成:  `Bool`

* `matchRules`  自定义的匹配自动完成url的规则:  `List[regex] (maxlength: 10)`

#### 例

```json
{
    "name": "test",
    "uuid": "fDWpVN5fmRzHitYebUy3Ws",
    "pwdCollectionIdList": ["gLbjR5k8myNmmYc2fDrdW3", "C5K4HR7LSyDVeuaHNVE4Gm"],
    "pwdCollectionDict": {
        "gLbjR5k8myNmmYc2fDrdW3": {
            "name": "test",
            "uuid": "gLbjR5k8myNmmYc2fDrdW3",
            "pwdDict": {
                "NS3Am8BDHTf3VfMdMgDN4a": {
                    "name": "test1",
                    "password": "123456",
                    "uuid": "NS3Am8BDHTf3VfMdMgDN4a",
                    "username": "\u5f80uaie"
                },
                "jG6HdeixsNexZ3x35MJ5Jr": {
                    "name": "test2",
                    "password": "123456",
                    "uuid": "jG6HdeixsNexZ3x35MJ5Jr"
                },
                "cLouzFhipht3jWELpp5b6c": {
                    "name": "test3",
                    "password": "123456",
                    "uuid": "cLouzFhipht3jWELpp5b6c"
                },
                "XezPQzkNBgvG9p7WmeEKGs": {
                    "name": "test4",
                    "password": "123456",
                    "uuid": "XezPQzkNBgvG9p7WmeEKGs"
                }
            },
            "idList": ["NS3Am8BDHTf3VfMdMgDN4a", "jG6HdeixsNexZ3x35MJ5Jr", "cLouzFhipht3jWELpp5b6c", "XezPQzkNBgvG9p7WmeEKGs"]
        },
        "C5K4HR7LSyDVeuaHNVE4Gm": {
            "name": "test2",
            "uuid": "C5K4HR7LSyDVeuaHNVE4Gm",
            "pwdDict": {
                "NS3Am8BDHTf3VfMdMgDN4a": {
                    "name": "test1",
                    "password": "123456",
                    "uuid": "NS3Am8BDHTf3VfMdMgDN4a",
                    "username": "\u5f80uaie"
                },
                "jG6HdeixsNexZ3x35MJ5Jr": {
                    "name": "test2",
                    "password": "123456",
                    "uuid": "jG6HdeixsNexZ3x35MJ5Jr"
                },
                "cLouzFhipht3jWELpp5b6c": {
                    "name": "test3",
                    "password": "123456",
                    "uuid": "cLouzFhipht3jWELpp5b6c"
                },
                "XezPQzkNBgvG9p7WmeEKGs": {
                    "name": "test4",
                    "password": "123456",
                    "uuid": "XezPQzkNBgvG9p7WmeEKGs"
                }
            },
            "idList": ["NS3Am8BDHTf3VfMdMgDN4a", "jG6HdeixsNexZ3x35MJ5Jr", "cLouzFhipht3jWELpp5b6c", "XezPQzkNBgvG9p7WmeEKGs"]
        }
    }
}
```







