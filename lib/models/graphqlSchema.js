const schema = buildSchema(`
  type Paste {
    title: String,
    content: String,
    user: String,
    tags: String
  }
`);

type Paste {
  title: String!,
  user: User!
}

type User {
  uid: String!,
  authorization:
}

const AuthorizationType = new GraphQLEnumType({
  name: "authorization",
  values: {
    ADMIN: { value: 0 },
    USER: { value: 1}
  }
})
