const { graphql,
        GraphQLString,
        GraphQLInt,
        GraphQLBoolean,
        GraphQLObjectType,
        GraphQLList
      } = require('graphql');

const CommentType = new graphql.GraphQLObjectType({
  name: "Comment",
  description: "An individual comment for a paste, this is a leaf type",
  fields: () => {
    return {
      id: {
        type: GraphQLString,
        description: 'The ID of this comment'
      },
      position: {
        type: GraphQLInt,
        description: 'The position in the paste this comment resides'
      },
      dateModified: {
        type: GraphQLInt,
        description: 'The laste time this comment was modified (edited or deleted)'
      },
      deleted: {
        type: GraphQLBoolean,
        description: 'Whether or not this comment was deleted (the system works on soft deletions)'
      },
      content: {
        type: GraphQLString,
        description: 'The actual content of this comment'
      }
    }
  }
});

const CommentSetType = new GraphQLObjectType({
  name: "CommentSet",
  description: "The set of comments belonging to a paste",
  fields: () => {
    return {
      key: {
        type: GraphQLString,
        description: "The key for this CommentSet"
      },
      comments: {
        type: GraphQLList(CommentType),
        description: "The list of Comments"
      }
    }
  }
});

const PasteType = new GraphQLObjectType({
  name: "Paste",
  description: "A paste in the glue-basket",
  fields: () => {
    return {
      title: {
        type: GraphQLString,
        description: "The title for this paste"
      },
      user: {
        type: GraphQLString,
        description: "The user who originally created this paste"
      },
      content: {
        type: GraphQLString,
        description: "The actual content of the paste"
      },
      tags: {
        type: GraphQLList(GraphQLString),
        description: "Tags from the user"
      }
    }
  }
})
